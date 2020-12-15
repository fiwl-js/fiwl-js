import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";
import RenderAPI from "../display/renderer/RenderAPI";
import DisplayObject from "./DisplayObject";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";
import StrokePathInstruct from "../display/renderer/instructs/StrokePathInstruct";
import VertexTemplate from "../display/renderer/templates/VertexTemplate";

// Private properties //
const priv_selectListener: WeakMap<Checkbox, () => void> = new WeakMap();
const priv_hoverListener: WeakMap<Checkbox, () => void> = new WeakMap();
const priv_unhoverListener: WeakMap<Checkbox, () => void> = new WeakMap();
const priv_targetHoverOpacity: WeakMap<Checkbox, number> = new WeakMap();
const priv_currentHoverOpacity: WeakMap<Checkbox, number> = new WeakMap();
const priv_tickmarkOpacity: WeakMap<Checkbox, number> = new WeakMap();

export default class Checkbox extends DisplayObject {
  public checked = false;
  public tickColor = app.colors.white;

  constructor() {
    super();
    this.height = "content";
    this.width = "content";
    this.backgroundColor = app.colors.transparent;
    this.foregroundColor = app.res.style.secondaryColor;
    this.borderColor = 0x616161;
    this.borderSize = "2dp";

    priv_selectListener.set(this, () => {
      this.checked = !this.checked;
      priv_animateTickmark(this);
    });

    priv_hoverListener.set(this, () => {
      priv_targetHoverOpacity.set(this, 0.1);
      priv_animateHover(this);
      app.display.setCursor('clickable');
    })

    priv_unhoverListener.set(this, () => {
      priv_targetHoverOpacity.set(this, 0);
      priv_animateHover(this);
      app.display.setCursor('default');
    })

    priv_targetHoverOpacity.set(this, 0);
    priv_currentHoverOpacity.set(this, 0);
    priv_tickmarkOpacity.set(this, 0);
  }

  ready(): void {
    this.addEventListener(EventTypes.SELECT, priv_selectListener.get(this));
    this.addEventListener(EventTypes.MOUSE_HOVER_START, priv_hoverListener.get(this));
    this.addEventListener(EventTypes.MOUSE_HOVER_END, priv_unhoverListener.get(this));
  }

  suspend(): void {
    this.removeEventListener(EventTypes.SELECT, priv_selectListener.get(this));
    this.removeEventListener(EventTypes.MOUSE_HOVER_START, priv_hoverListener.get(this));
    this.removeEventListener(EventTypes.MOUSE_HOVER_END, priv_unhoverListener.get(this));
  }

  draw(api: RenderAPI): InstructTemplate[] {
    let instructs: InstructTemplate[] = [];

    const x = this.globalX;
    const y = this.globalY;
    const width = this.measuredWidth;
    const height = this.measuredHeight;
    const lineSize = app.unit.resolve(this.borderSize);
    const boxSize = Math.min(app.unit.resolve("16dp"), width, height);
    const box_x = x + ((width - boxSize) / 2);
    const box_y = y + ((height - boxSize) / 2);
    const diameter = Math.min(width, height);
    const hoverOpacity = priv_currentHoverOpacity.get(this);
    const tickmarkOpacity = priv_tickmarkOpacity.get(this);

    if (hoverOpacity > 0) {
      let hoverCircle = api.ellipse(
        x + Math.max(width-height, 0),
        y + Math.max(height-width, 0),
        diameter, diameter,
        app.colors.Convert.rgba(0, 0, 0, hoverOpacity)
      );
      instructs.push(hoverCircle);
    }

    if (this.backgroundColor != app.colors.transparent) {
      let backgroundBox = api.rect(
        box_x, box_y,
        boxSize, boxSize,
        this.backgroundColor
      );
      instructs.push(backgroundBox);
    }

    let borderBox = api.lineRect(
      box_x, box_y,
      boxSize, boxSize,
      this.borderColor,
      lineSize
    );
    instructs.push(borderBox);

    if (tickmarkOpacity > 0) {
      let tickBg = api.rect(
        box_x - (lineSize / 2),
        box_y - (lineSize / 2),
        boxSize + lineSize,
        boxSize + lineSize,
        this.foregroundColor
      );

      let tickVertices: VertexTemplate[] = [
        {x: box_x + (lineSize*2),           y: box_y + (boxSize/2)           },
        {x: box_x + (boxSize/2) - lineSize, y: box_y + boxSize - (lineSize*2)},
        {
          x: box_x + (boxSize * tickmarkOpacity) - (lineSize*2),
          y: box_y + (lineSize*2) + (boxSize * (1-tickmarkOpacity))
        }
      ]
      let tickmark = api.linePath(
        this.tickColor,
        tickVertices,
        app.unit.resolve(lineSize),
      )

      let groupedTick = api.group([tickBg, tickmark]);
      let fadingTick = api.transparency(groupedTick, tickmarkOpacity);
      instructs.push(fadingTick);
    }

    return this.drawPostEffect(api, instructs);
  }

  /** Get minimal width (equals .width = "content"), primitive DisplayObject will returns 0 */
  get measuredContentsWidth(): number {
    return app.unit.resolve("48dp");
  }

  /** Get minimal height (equals .height = "content"), primitive DisplayObject will returns 0 */
  get measuredContentsHeight(): number {
    return app.unit.resolve("48dp");
  }
}

/**
 *  @private
 *  Animate hover circle
 */
function priv_animateHover(instance: Checkbox): void {
  // Making sure priv_animateHover(...) not executed in parallel
  const internal = Checkbox.internal.get(instance);
  if(!isNaN(internal.hoverAnimationID)) {
    window.cancelAnimationFrame(internal.hoverAnimationID);
    internal.hoverAnimationID = NaN;
  }

  const currentOpacity = priv_currentHoverOpacity.get(instance);
  const targetOpacity = priv_targetHoverOpacity.get(instance);

  if (Math.round(currentOpacity*1000)/1000 != Math.round(targetOpacity*1000)/1000) {
    const newOpacity = currentOpacity + ((targetOpacity - currentOpacity) / 16);
    priv_currentHoverOpacity.set(instance, newOpacity);
    internal.hoverAnimationID = window.requestAnimationFrame(() => priv_animateHover(instance));
  } else {
    priv_currentHoverOpacity.set(instance, targetOpacity);
  }

  Checkbox.internal.set(instance, internal);
  instance.requestUpdate();
}

/**
 *  @private
 *  Animate tickmark
 */
function priv_animateTickmark(instance: Checkbox): void {
  // Making sure priv_animateHover(...) not executed in parallel
  const internal = Checkbox.internal.get(instance);
  if(!isNaN(internal.tickmarkAnimationID)) {
    window.cancelAnimationFrame(internal.tickmarkAnimationID);
    internal.tickmarkAnimationID = NaN;
  }

  const currentOpacity = priv_tickmarkOpacity.get(instance);
  const targetOpacity = instance.checked ? 1 : 0;

  if((Math.round(currentOpacity*1000)/1000) != targetOpacity) {
    const newOpacity = currentOpacity + ((targetOpacity - currentOpacity) / 8)
    priv_tickmarkOpacity.set(instance, newOpacity);
    internal.tickmarkAnimationID = window.requestAnimationFrame(() => priv_animateTickmark(instance));
  } else {
    priv_tickmarkOpacity.set(instance, targetOpacity);
  }

  Checkbox.internal.set(instance, internal);
  instance.requestUpdate();
}
