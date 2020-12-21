import Label from "./Label";
import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";
import PointingEventData from "../event/data/PointingEventData";
import RenderAPI from "../display/renderer/RenderAPI";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";

const priv_ripples: WeakMap<Button, Ripple[]> = new WeakMap();
const priv_hoverListener: WeakMap<Button, () => void> = new WeakMap();
const priv_unhoverListener: WeakMap<Button, () => void> = new WeakMap();
const priv_pressListener: WeakMap<Button, (eventData: PointingEventData) => void> = new WeakMap();
const priv_releaseListener: WeakMap<Button, () => void> = new WeakMap();
const priv_targetHoverOpacity: WeakMap<Button, number> = new WeakMap();
const priv_currentHoverOpacity: WeakMap<Button, number> = new WeakMap();
const priv_isPressing: WeakMap<Button, boolean> = new WeakMap();

export default class Button extends Label {
  public rippleColor: number = 0xdf000000;

  constructor() {
    super();
    this.paddings = "16dp";
    this.alignText = "center";
    this.cornerRadius = "8dp";
    this.elevation = "8dp";
    this.textColor = app.res.style.onSecondaryColor;
    this.backgroundColor = app.res.style.secondaryColor;
    
    priv_ripples.set(this, []);
    priv_targetHoverOpacity.set(this, 0);
    priv_currentHoverOpacity.set(this, 0);

    priv_hoverListener.set(this, () => {
      priv_targetHoverOpacity.set(this, 0.5);
      priv_animateHover(this);
      app.display.setCursor("clickable");
    })

    priv_unhoverListener.set(this, () => {
      priv_targetHoverOpacity.set(this, 0);
      priv_animateHover(this);
      app.display.setCursor("default");

      // Continue animate last ripple
      priv_isPressing.set(this, false);
      const rippleArray = priv_ripples.get(this)
      if(rippleArray.length > 0) {
        priv_animateRipple(this, rippleArray[rippleArray.length-1])
      }
    })

    priv_pressListener.set(this, (eventData: PointingEventData) => {
      const rippleArray = priv_ripples.get(this)
      
      // Update "isLastRipple" property on previous last ripple
      if(rippleArray.length > 0) {
        rippleArray[rippleArray.length-1].isLastRipple = false;
      }
      
      // Create new ripple
      const ripple: Ripple = {
        x: eventData.x,
        y: eventData.y,
        r: 0,
        rMax: priv_calculateRMax(this, eventData.x, eventData.y),
        alpha: 1,
        frame: 0,
        isLastRipple: true
      };
      rippleArray.push(ripple);
      
      // Update state
      priv_isPressing.set(this, true);
      priv_animateRipple(this, ripple);
    });

    priv_releaseListener.set(this, () => {
      priv_isPressing.set(this, false);
      const rippleArray = priv_ripples.get(this);
      if(rippleArray.length > 0) {
        priv_animateRipple(this, rippleArray[rippleArray.length-1])
      }
    })
  }

  ready(): void {
    this.addEventListener(EventTypes.MOUSE_HOVER_START, priv_hoverListener.get(this));
    this.addEventListener(EventTypes.MOUSE_HOVER_END, priv_unhoverListener.get(this));
    this.addEventListener(EventTypes.MOUSE_LEFT_PRESS, priv_pressListener.get(this));
    this.addEventListener(EventTypes.MOUSE_LEFT_RELEASE, priv_releaseListener.get(this));
  }

  suspend(): void {
    this.removeEventListener(EventTypes.MOUSE_HOVER_START, priv_hoverListener.get(this));
    this.removeEventListener(EventTypes.MOUSE_HOVER_END, priv_unhoverListener.get(this));
    this.removeEventListener(EventTypes.MOUSE_LEFT_PRESS, priv_pressListener.get(this));
    this.removeEventListener(EventTypes.MOUSE_LEFT_RELEASE, priv_releaseListener.get(this));
  }

  drawBackground(api: RenderAPI): InstructTemplate[] {
    let renderList: InstructTemplate[] = [];

    const background = api.group(super.drawBackground(api));
    renderList.push(background);

    const x = this.globalX;
    const y = this.globalY;
    const width = this.measuredWidth;
    const height = this.measuredHeight;
    const hoverOpacity = priv_currentHoverOpacity.get(this);

    const hover = api.rect(x, y, width, height, this.rippleColor);
    const translucentHover = api.transparency(hover, hoverOpacity);
    renderList.push(translucentHover);

    const ripples = priv_ripples.get(this);
    for (let iter = 0; iter < ripples.length; iter++) {
      const eachRipple = ripples[iter];
      if (eachRipple.frame >= 60) {
        ripples.splice(iter, 1);
        iter--;
        continue;
      }
      const circle = api.ellipse(
        eachRipple.x - eachRipple.r / 2,
        eachRipple.y - eachRipple.r / 2,
        eachRipple.r,
        eachRipple.r,
        this.rippleColor
      );
      const transparentCircle = api.transparency(circle, eachRipple.alpha);
      renderList.push(transparentCircle);
    }

    const grouped = api.group(renderList);
    const masked = api.mask(grouped, background);
    renderList = [masked];

    return renderList;
  }
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  rMax: number;
  alpha: number;
  frame: number;
  isLastRipple: boolean;
}

/**
 *  @private
 *  Animate hover effect
 */
function priv_animateHover(instance: Button): void {
  // Making sure priv_animateHover(...) not executed in parallel
  const internal = Button.internal.get(instance);
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

  Button.internal.set(instance, internal);
  instance.requestUpdate();
}

/**
 *  @private
 *  Animate ripple effect
 */
function priv_animateRipple(instance: Button, ripple: Ripple) {
  if (ripple.r < ripple.rMax) {
    ripple.r += 8 * app.display.scale;
  } else {
    ripple.r = ripple.rMax;
  }

  if (ripple.frame > 30) {
    ripple.alpha = 1 - (ripple.frame - 30) / 30;
  }

  // Update the instance
  instance.requestUpdate();

  // Calculate last frame based on "isPressing" and "isLastFrame"
  let lastFrame = 60;
  const isPressing = priv_isPressing.get(instance);
  if (isPressing && ripple.isLastRipple) {
    lastFrame = 30;
  }

  if (ripple.frame < lastFrame) {
    ripple.frame++;
    requestAnimationFrame(() => priv_animateRipple(instance, ripple));
  }
}

/**
 *  @private
 *  Calculate biggest radius possible for ripple circle
 */
function priv_calculateRMax(instance: Button, x: number, y: number): number {
  const globalX = instance.globalX;
  const globalY = instance.globalY;
  const measuredWidth = instance.measuredWidth;
  const measuredHeight = instance.measuredHeight;

  const toTopLeft = Math.sqrt(
    Math.pow(x - globalX, 2) + Math.pow(y - globalY, 2)
  );
  const toTopRight = Math.sqrt(
    Math.pow(x - (globalX + measuredWidth), 2) + Math.pow(y - globalY, 2)
  );
  const toBottomRight = Math.sqrt(
    Math.pow(x - (globalX + measuredWidth), 2) +
      Math.pow(y - (globalY + measuredHeight), 2)
  );
  const toBottomLeft = Math.sqrt(
    Math.pow(x - globalX, 2) + Math.pow(y - (globalY + measuredHeight), 2)
  );

  return Math.max(toTopLeft, toTopRight, toBottomRight, toBottomLeft) * 2;
}
