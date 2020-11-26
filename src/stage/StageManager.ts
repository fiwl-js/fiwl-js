import PassiveStage from "./PassiveStage";
import parseStage from "../parser/parseStage";
import NetworkManager from "../network/NetworkManager";
import DisplayObject from "../widgets/DisplayObject";
import Layout from "../widgets/Layout";
import FIWLStage from "./FIWLStage";
import interactStage from "../interactor/interactStage";
import EnvironmentManager from "../environment/EnvironmentManager";
import DisplayManager from "../display/DisplayManager";
import { StageStatus } from "./StageStatusEnum";
import EventManager from "../event/EventManager";

/** Stores previously visited stage, so re-downloading isn't necessary */
const backstack: Array<PassiveStage> = [];

/** Stores return value of requestAnimationFrame() at update() */
let updateHandler: number = NaN;

/** Making sure every function called on the right time */
let currentStatus: StageStatus = StageStatus.UNAVAILABLE;

/**
 *  Go to stage, then manage the backstack
 *
 *  WARNING: This only change app.stage only, use FIWLApplication#goto(...) instead.
 */
async function goto(route: string): Promise<void> {
  if (currentStatus == StageStatus.FOCUS) {
    unfocus();
  }

  if (currentStatus == StageStatus.ACTIVE) {
    close();
  }

  const index: number = getStackIndex(route);
  let passiveStage: PassiveStage;

  if (Number.isNaN(index)) {
    try {
      await create(route);
    } catch (error) {
      if (route != "/" && route != "") {
        console.error(error);
        onStageNotFound();
      } else {
        throw error;
      }
      return;
    }
    passiveStage = backstack[backstack.length - 1];
  } else {
    // Move the stage to end of backstack if exist
    passiveStage = backstack.splice(index, 1)[0];
    backstack.push(passiveStage);
  }

  await activate();
  focus();
}

function onStageNotFound() {
  if (backstack.length > 0) {
    const lastStack = backstack[backstack.length - 1];
    //app.goto(lastStack.url);
  } else {
    //app.goto('/');
    window.location.href = "/";
  }
}

/** Returns NaN if intended stage isn't exist at stack */
function getStackIndex(route: string): number {
  for (let iter = 0; iter < backstack.length; iter++) {
    const eachStack = backstack[iter];
    if (eachStack.url == route) {
      return iter;
    }
  }
  return NaN;
}

/** Returns null if intended stage isn't exist at stack */
function findAtStack(route: string): PassiveStage {
  const index = getStackIndex(route);
  if (isNaN(index)) {
    return null;
  } else {
    return backstack[index];
  }
}

function triggerListener(
  listener: Function | string,
  context: Object
): Promise<void> | void {
  switch (typeof listener) {
    case "function":
      return listener.call(context);
    case "string":
      return new Function(listener).call(context);
  }
}

/** Download, parse, and put new stage to backstack */
async function create(route: string): Promise<void> {
  // Resolve path:
  let resURL = app.res.url;
  if (!resURL.startsWith("/")) resURL = "/" + resURL;
  if (!resURL.endsWith("/")) resURL += "/";
  let fiwlPath = resURL + "main.fiwl";

  // Check configuration on manifest.json
  for (let iter = 0; iter < app.manifest.stages.length; iter++) {
    const eachStage = app.manifest.stages[iter];
    if (eachStage.route == route) {
      if (typeof eachStage.layout == "string") {
        fiwlPath = resURL + eachStage.layout.replace(/^\//, "");
      }
      break;
    }
  }

  // Download and parse .fiwl as Stage
  const rawData = await NetworkManager.get(fiwlPath);
  const parsed = parseStage(rawData) as PassiveStage;
  backstack.push(parsed);
  currentStatus = StageStatus.PASSIVE;

  // Call "asyncCreate" and "onAsyncCreate" on every widget
  await asyncWidgetCreate(parsed.layout);

  // Call the callback from stage if exist
  triggerListener(parsed.onCreated, parsed);
}

/**
 *  Call each widget's asynchronous constructor (a.k.a. asyncCreate function).
 *  This helps stage load all icons, fonts, etc while displaying "loading" animation.
 */
async function asyncWidgetCreate(target: DisplayObject): Promise<void> {
  await target.asyncCreate.call(target);
  if (target instanceof Layout) {
    const promiseArray: Array<Promise<void>> = [];
    for (let iter = 0; iter < target.length; iter++) {
      const eachContent = target.contents[iter];
      promiseArray.push(asyncWidgetCreate(eachContent));
    }
    await Promise.all(promiseArray);
  }
  await triggerListener(target.onAsyncCreate, target);
}

/** Build interactive stage from latest backstack, then expose */
async function activate() {
  if (currentStatus != StageStatus.PASSIVE) {
    console.error(
      "StageManager.activate() only called when currentStatus = PASSIVE"
    );
    return;
  }

  const passiveStage = backstack[backstack.length - 1];
  let stage = new FIWLStage();

  interactStage(passiveStage, stage, update);
  EnvironmentManager.putMetaConst(app, "stage", stage);
  await DisplayManager.nextStage(stage);
  if (typeof stage.onDraw == "function") stage.onDraw.call(stage);

  if (typeof stage.title == "string") {
    document.title = stage.title;
  }

  if (typeof stage.description != "string") {
    stage.description = app.manifest.description
  }

  EventManager.attachRootLayout(stage.layout);

  currentStatus = StageStatus.ACTIVE;
  callWidgetsOnReady(stage.layout);
  triggerListener(stage.onReady, stage);
}

/** Recrusively call every widgets' "ready" and "onReady" function */
function callWidgetsOnReady(target: DisplayObject): void {
  if (target instanceof Layout) {
    for (let iter = 0; iter < target.length; iter++) {
      const eachContent = target.contents[iter];
      callWidgetsOnReady(eachContent);
    }
  }
  target.ready();
  triggerListener(target.onReady, target);
}

function focus() {
  EventManager.startDispatchers();
  currentStatus = StageStatus.FOCUS;
  triggerListener(app.stage.onFocus, app.stage);
}

function update(from: DisplayObject, key: string = "") {
  if (currentStatus != StageStatus.FOCUS) return;
  if (isNaN(updateHandler)) {
    updateHandler = requestAnimationFrame(() => {
      DisplayManager.render();
      updateHandler = NaN;
      triggerListener(app.stage.onDraw, app.stage);
    });
  }
  triggerListener(app.stage.onUpdate, app.stage);
}

function unfocus() {
  triggerListener(app.stage.onUnfocus, app.stage);
  EventManager.stopDispatchers();
  currentStatus = StageStatus.ACTIVE;
}

/** Teardown the interactive stage, then detach */
function close() {
  if (currentStatus != StageStatus.ACTIVE) {
    console.error(
      "StageManager.close() only called when currentStatus = ACTIVE"
    );
    return;
  }

  document.title = app.manifest.name;

  triggerListener(app.stage.onSuspend, app.stage);
  EventManager.resetListenerMap();
  recrusiveTeardown(app.stage.layout);
  EnvironmentManager.putMetaConst(app, "stage", null);
}

/** Detach container-content linking to make sure Garbage Collector destroys interactive widgets */
function recrusiveTeardown(target: DisplayObject): void {
  target.suspend();
  triggerListener(target.onSuspend, target);
  if (target instanceof Layout) {
    for (let iter = 0; iter < target.length; iter++) {
      const eachContent = target.contents[iter];
      recrusiveTeardown(eachContent);
    }
  }
  DisplayObject.internal.delete(target);
}

function destroy(stackIndex: number) {
  //
}

// Exposable functions:
export default {
  goto: goto,
  focus: focus,
  unfocus: unfocus,
};
