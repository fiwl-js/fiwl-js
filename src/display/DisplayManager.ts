import RenderEngine from "./renderer/RenderEngine";
import RenderAPI from "./renderer/RenderAPI";
import ParamsTemplate from "../environment/ParamsTemplate";
import LayerTemplate from "./LayerTemplate";
import InstructTemplate from "./renderer/templates/InstructTemplate";
import BootAnimLayer from "./layers/BootAnimLayer";
import NetworkManager from "../network/NetworkManager";
import FIWLStage from "../stage/FIWLStage";

let renderer: RenderEngine;
let layers: Array<LayerTemplate> = [];

/** If true, renderer always render. Only for animating display layer! */
let constantLoop: boolean = false;

/** Every return value of requestAnimationFrame(...) must be placed here */
let animHandler: number = NaN;

async function attachRenderer(params: ParamsTemplate): Promise<void> {
  renderer = new RenderEngine(params.domID, params.immersive);

  if (params.immersive === true) {
    window.addEventListener("resize", () => render());
  }

  if (app.manifest.splash) {
    await startBootAnim(app.manifest.splash);
    constantLoop = true;
  }

  requestAnimationFrame(render);
}

function startBootAnim(splashURL: string): Promise<void> {
  return new Promise((resolve) => {
    if (splashURL.toLowerCase().endsWith(".svg")) {
      NetworkManager.getImage(splashURL)
        .then((result) => {
          layers.push(new BootAnimLayer(result));
          resolve();
        })
        .catch((error) => {
          console.error(error);
          layers.push(new BootAnimLayer());
          resolve();
        });
    } else {
      layers.push(new BootAnimLayer());
      resolve();
    }
  });
}

async function stopBootAnim(): Promise<void> {
  const bootLayer = findLayer("boot") as BootAnimLayer;
  if (bootLayer != null) {
    await bootLayer.close();
    constantLoop = false;
    removeLayer(bootLayer.tag);
  }
}

async function nextStage(newStage: FIWLStage): Promise<void> {
  const newStageLayer: LayerTemplate = {
    tag: "",
    objectContext: newStage.layout,
    drawFunc: newStage.layout.draw,
    x: 0,
    y: 0,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
  };

  layers.unshift(newStageLayer);

  if (findLayer("boot") != null) {
    newStageLayer.tag = "stage";
    await stopBootAnim();
  } else {
    const oldStage = findLayer("stage");
    // Transition here...
    render()
  }
}

function findLayer(tag: string): LayerTemplate {
  for (let iter = 0; iter < layers.length; iter++) {
    const eachLayer = layers[iter];
    if (eachLayer.tag == tag) {
      return eachLayer;
    }
  }
  return null;
}

function removeLayer(tag: string): void {
  for (let iter = 0; iter < layers.length; iter++) {
    const eachLayer = layers[iter];
    if (eachLayer.tag == tag) {
      layers.splice(iter, 1);
    }
  }
}

function render(): void {
  if (!isNaN(animHandler)) {
    cancelAnimationFrame(animHandler);
    animHandler = NaN;
  }

  const api: RenderAPI = RenderAPI.api;
  renderer.reset();
  for (let iter = 0; iter < layers.length; iter++) {
    const eachLayer = layers[iter];
    let instructs = api.group(
      eachLayer.drawFunc.call(eachLayer.objectContext, api)
    ) as InstructTemplate;
    if (eachLayer.scaleX != 1 || eachLayer.scaleY != 1) {
      instructs = api.scale(
        instructs,
        eachLayer.scaleX,
        eachLayer.scaleY,
        0,
        0,
        getWidth(),
        getHeight()
      );
    }
    if (eachLayer.x != 0 || eachLayer.y != 0) {
      instructs = api.translate(instructs, eachLayer.x, eachLayer.y);
    }
    if (eachLayer.alpha != 1) {
      instructs = api.transparency(instructs, eachLayer.alpha);
    }
    renderer.pushInstruction(instructs);
  }

  if (constantLoop) {
    animHandler = requestAnimationFrame(render);
  }
}

// These are required for DisplayInterface binding
function getScale(): number {
  return renderer.scale;
}
function getWidth(): number {
  return Math.round(renderer.width);
}
function getHeight(): number {
  return Math.round(renderer.height);
}
function setCursor(
  name:
    | "default"
    | "processing"
    | "clickable"
    | "text"
    | "move"
    | "draggable"
    | "dragging"
    | "denied"
): void {
  if (renderer) renderer.setCursor(name);
}

export default {
  attachRenderer: attachRenderer,
  getScale: getScale,
  getWidth: getWidth,
  getHeight: getHeight,
  render: render,
  setCursor: setCursor,
  nextStage: nextStage,
};
