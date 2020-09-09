import DispatcherTemplate from "../templates/DispatcherTemplate";
import { EventTypes } from "../EventTypesEnum";
import ListenerTemplate from "../templates/ListenerTemplate";
import TouchEventData from "../data/TouchEventData";
import FingerPointTemplate from "../templates/FingerPointTemplate";
import EventManager from "../EventManager";

export default class TouchEventDispatcher implements DispatcherTemplate {
  private viewportInstance: HTMLCanvasElement;

  private startListeners: ListenerTemplate[];
  private doubleListeners: ListenerTemplate[];
  private longListeners: ListenerTemplate[];
  private moveListeners: ListenerTemplate[];
  private endListeners: ListenerTemplate[];
  private zoomListeners: ListenerTemplate[];
  private rotateListeners: ListenerTemplate[];

  private doubleHandler: number = NaN;
  private holdHandler: number = NaN;

  private lastX: number = NaN;
  private lastY: number = NaN;

  attach(
    viewportInstance: HTMLCanvasElement,
    listenerMap: Map<EventTypes, ListenerTemplate[]>
  ): void {
    this.viewportInstance = viewportInstance;
    this.startListeners = listenerMap.get(EventTypes.TOUCH_START);
    this.doubleListeners = listenerMap.get(EventTypes.TOUCH_DOUBLE);
    this.longListeners = listenerMap.get(EventTypes.TOUCH_LONG);
    this.moveListeners = listenerMap.get(EventTypes.TOUCH_MOVE);
    this.endListeners = listenerMap.get(EventTypes.TOUCH_END);
    this.zoomListeners = listenerMap.get(EventTypes.TOUCH_ZOOM);
    this.rotateListeners = listenerMap.get(EventTypes.TOUCH_ROTATE);
  }

  start(): void {
    this.viewportInstance.addEventListener("touchstart", this.triggerStart);
    this.viewportInstance.addEventListener("touchmove", this.triggerMove);
    this.viewportInstance.addEventListener("touchend", this.triggerEnd);
  }

  stop(): void {
    this.viewportInstance.removeEventListener("touchstart", this.triggerStart);
    this.viewportInstance.removeEventListener("touchmove", this.triggerMove);
    this.viewportInstance.removeEventListener("touchend", this.triggerEnd);
  }

  private triggerStart = (domEventData: TouchEvent): void => {
    domEventData.preventDefault();
    if (this.startListeners.length == 0 && domEventData.touches.length != 1)
      return;

    const currentFinger = domEventData.changedTouches[0];
    const fingers = this.compileFingers(domEventData.touches);

    const eventData: TouchEventData = {
      type: EventTypes.TOUCH_START,
      id: currentFinger.identifier,
      x: currentFinger.clientX,
      y: currentFinger.clientY,
      pressure: currentFinger.force * 2,
      width: currentFinger.radiusX * 2,
      height: currentFinger.radiusY * 2,
      rotate: 0,
      zoom: 0,
      velocityX: 0,
      velocityY: 0,
      scrollX: 0,
      scrollY: 0,
      fingers: fingers,
      count: fingers.length,
      dragging: false,
      withALT: domEventData.altKey,
      withCTRL: domEventData.ctrlKey,
      withShift: domEventData.shiftKey,
    };

    if (isNaN(this.holdHandler)) {
      if (fingers.length == 1) {
        this.holdHandler = window.setTimeout(
          () => this.triggerLong(eventData),
          1000
        );
      }
    } else {
      window.clearTimeout(this.holdHandler);
      this.holdHandler == NaN;
    }

    if (this.startListeners.length == 0) return;

    for (let iter = 0; iter < this.startListeners.length; iter++) {
      const eachListener = this.startListeners[iter];
      if (eachListener.target) {
        const target = eachListener.target;
        if (
          EventManager.isInTarget(
            target,
            currentFinger.clientX,
            currentFinger.clientY
          )
        ) {
          eachListener.func.call(target, { ...eventData, target: target });
        }
      } else {
        eachListener.func({ ...eventData });
      }
    }
  };

  private triggerLong(eventData: TouchEventData): void {
    this.holdHandler = NaN;

    for (let iter = 0; iter < this.longListeners.length; iter++) {
      const eachListener = this.longListeners[iter];
      if (eachListener.target) {
        const target = eachListener.target;
        if (EventManager.isInTarget(target, eventData.x, eventData.y)) {
          eachListener.func({
            ...eventData,
            type: EventTypes.TOUCH_LONG,
            target: target,
          });
        }
      } else {
        eachListener.func({ ...eventData, type: EventTypes.TOUCH_LONG });
      }
    }
  }

  private triggerMove = (domEventData: TouchEvent): void => {
    domEventData.preventDefault();

    if (!isNaN(this.holdHandler)) {
      window.clearTimeout(this.holdHandler);
      this.holdHandler = NaN;
    }

    const currentFinger = domEventData.changedTouches[0];

    let velocityX: number = 0,
      velocityY: number = 0;
    if (currentFinger.identifier == 0) {
      if (isNaN(this.lastX)) {
        this.lastX = currentFinger.clientX;
      } else {
        velocityX = currentFinger.clientX - this.lastX;
        this.lastX = currentFinger.clientX;
      }

      if (isNaN(this.lastY)) {
        this.lastY = currentFinger.clientY;
      } else {
        velocityY = currentFinger.clientY - this.lastY;
        this.lastY = currentFinger.clientY;
      }
    }

    if (this.moveListeners.length == 0) return;

    const fingers = this.compileFingers(domEventData.touches);

    const eventData: TouchEventData = {
      type: EventTypes.TOUCH_MOVE,
      id: currentFinger.identifier,
      x: currentFinger.clientX,
      y: currentFinger.clientY,
      pressure: currentFinger.force * 2,
      width: currentFinger.radiusX * 2,
      height: currentFinger.radiusY * 2,
      rotate: 0,
      zoom: 0,
      velocityX: velocityX,
      velocityY: velocityY,
      scrollX: velocityX,
      scrollY: velocityY,
      fingers: fingers,
      count: fingers.length,
      dragging: false,
      withALT: domEventData.altKey,
      withCTRL: domEventData.ctrlKey,
      withShift: domEventData.shiftKey,
    };

    for (let iter = 0; iter < this.moveListeners.length; iter++) {
      const eachListener = this.moveListeners[iter];
      if (eachListener.target) {
        const target = eachListener.target;
        if (
          EventManager.isInTarget(
            target,
            currentFinger.clientX,
            currentFinger.clientY
          )
        ) {
          eachListener.func.call(target, { ...eventData, target: target });
        }
      } else {
        eachListener.func({ ...eventData });
      }
    }
  };

  private triggerEnd = (domEventData: TouchEvent): void => {
    domEventData.preventDefault();

    if (!isNaN(this.holdHandler)) {
      window.clearTimeout(this.holdHandler);
      this.holdHandler = NaN;
    }

    const currentFinger = domEventData.changedTouches[0];

    let velocityX: number = 0,
      velocityY: number = 0;
    if (currentFinger.identifier == 0) {
      if (isNaN(this.lastX)) {
        this.lastX = currentFinger.clientX;
      } else {
        velocityX = currentFinger.clientX - this.lastX;
        this.lastX = currentFinger.clientX;
      }

      if (isNaN(this.lastY)) {
        this.lastY = currentFinger.clientY;
      } else {
        velocityY = currentFinger.clientY - this.lastY;
        this.lastY = currentFinger.clientY;
      }
    }

    if (this.endListeners.length == 0) return;

    const fingers = this.compileFingers(domEventData.touches);

    const eventData: TouchEventData = {
      type: EventTypes.TOUCH_END,
      id: currentFinger.identifier,
      x: currentFinger.clientX,
      y: currentFinger.clientY,
      pressure: currentFinger.force * 2,
      width: currentFinger.radiusX * 2,
      height: currentFinger.radiusY * 2,
      rotate: 0,
      zoom: 0,
      velocityX: velocityX,
      velocityY: velocityY,
      scrollX: velocityX,
      scrollY: velocityY,
      fingers: fingers,
      count: fingers.length,
      dragging: false,
      withALT: domEventData.altKey,
      withCTRL: domEventData.ctrlKey,
      withShift: domEventData.shiftKey,
    };

    for (let iter = 0; iter < this.endListeners.length; iter++) {
      const eachListener = this.endListeners[iter];
      if (eachListener.target) {
        const target = eachListener.target;
        if (
          EventManager.isInTarget(
            target,
            currentFinger.clientX,
            currentFinger.clientY
          )
        ) {
          eachListener.func.call(target, { ...eventData, target: target });
        }
      } else {
        eachListener.func({ ...eventData });
      }
    }
  };

  private compileFingers(domTouches: TouchList): FingerPointTemplate[] {
    const result: FingerPointTemplate[] = [];
    for (let iter = 0; iter < domTouches.length; iter++) {
      const eachDomTouch = domTouches[iter];
      result.push({
        id: eachDomTouch.identifier,
        x: eachDomTouch.clientX,
        y: eachDomTouch.clientY,
        width: eachDomTouch.radiusX * 2,
        height: eachDomTouch.radiusY * 2,
        pressure: eachDomTouch.force * 2,
      });
    }
    return result;
  }
}
