import Label from "./Label";
import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";
import PointingEventData from "../event/data/PointingEventData";
import RenderAPI from "../display/renderer/RenderAPI";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";

const priv_ripples: WeakMap<Button, Ripple[]> = new WeakMap();

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
  }

  ready(): void {
    // Change cursor on hover:
    this.addEventListener(
      EventTypes.MOUSE_HOVER_START,
      (eventData: MouseEventData) => {
        app.display.setCursor("clickable");
      }
    );
    this.addEventListener(
      EventTypes.MOUSE_HOVER_END,
      (eventData: MouseEventData) => {
        app.display.setCursor("default");
      }
    );

    // Start ripple animation:
    const animateRipple = (ripple: Ripple) => {
      if (ripple.r < ripple.rMax) {
        ripple.r += 8 * app.display.scale;
      } else {
        ripple.r = ripple.rMax;
      }

      if (ripple.frame > 30) {
        ripple.alpha = 1 - (ripple.frame - 30) / 30;
      }

      this.requestUpdate();

      if (ripple.frame < 60) {
        ripple.frame++;
        requestAnimationFrame(() => animateRipple(ripple));
      }
    };
    this.addEventListener(EventTypes.SELECT, (eventData: PointingEventData) => {
      const ripple: Ripple = {
        x: eventData.x,
        y: eventData.y,
        r: 0,
        rMax: calculateRMax(this, eventData.x, eventData.y),
        alpha: 1,
        frame: 0,
      };
      priv_ripples.get(this).push(ripple);
      requestAnimationFrame(() => animateRipple(ripple));
    });
  }

  drawBackground(api: RenderAPI): InstructTemplate[] {
    let renderList: InstructTemplate[] = [];

    const background = api.group(super.drawBackground(api));
    renderList.push(background);

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
}

function calculateRMax(instance: Button, x: number, y: number): number {
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
