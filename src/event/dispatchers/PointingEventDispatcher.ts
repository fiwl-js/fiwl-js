import DispatcherTemplate from "../templates/DispatcherTemplate";
import { EventTypes } from "../EventTypesEnum";
import ListenerTemplate from "../templates/ListenerTemplate";
import EventManager from "../EventManager";
import PointingEventData from "../data/PointingEventData";
import DisplayObject from "../../widgets/DisplayObject";

export default class PointingEventDispatcher implements DispatcherTemplate {
  private viewportInstance: HTMLCanvasElement;

  private selectListeners: ListenerTemplate[];
  //private doubleListeners:ListenerTemplate[];
  //private optionListeners:ListenerTemplate[];
  //private scrollListeners:ListenerTemplate[];
  //private dragStartListeners:ListenerTemplate[];
  //private dragMoveListeners:ListenerTemplate[];
  //private dragEndListeners:ListenerTemplate[];

  private pressedAtTarget: DisplayObject[] = [];

  attach(
    viewportInstance: HTMLCanvasElement,
    listenerMap: Map<EventTypes, ListenerTemplate[]>
  ): void {
    this.viewportInstance = viewportInstance;
    this.selectListeners = listenerMap.get(EventTypes.SELECT);
    //this.doubleListeners = listenerMap.get(EventTypes.DOUBLE);
    //this.optionListeners = listenerMap.get(EventTypes.OPTION);
    //this.scrollListeners = listenerMap.get(EventTypes.SCROLL);
    //this.dragStartListeners = listenerMap.get(EventTypes.DRAG_START);
    //this.dragMoveListeners = listenerMap.get(EventTypes.DRAG_MOVE);
    //this.dragEndListeners = listenerMap.get(EventTypes.DRAG_END);
  }

  start(): void {
    this.viewportInstance.addEventListener("mousedown", this.onMousePress);
    this.viewportInstance.addEventListener("mouseup", this.onMouseRelease);
    this.viewportInstance.addEventListener("touchstart", this.onTouchStart);
    this.viewportInstance.addEventListener("touchend", this.onTouchEnd);
  }

  stop(): void {
    this.viewportInstance.removeEventListener("mousedown", this.onMousePress);
    this.viewportInstance.removeEventListener("mouseup", this.onMouseRelease);
    this.viewportInstance.removeEventListener("touchstart", this.onTouchStart);
    this.viewportInstance.removeEventListener("touchend", this.onTouchEnd);
  }

  private onMousePress = (domEventData: MouseEvent): void => {
    if (domEventData.button != 0) return;
    this.aimSelect(
      domEventData.clientX,
      domEventData.clientY,
    )
  };

  private onMouseRelease = (domEventData: MouseEvent): void => {
    if (domEventData.button != 0) return;
    this.triggerSelect(
      domEventData.clientX,
      domEventData.clientY,
      domEventData
    );
  };

  private onTouchStart = (domEventData: TouchEvent): void => {
    domEventData.preventDefault();
    const currentTouch = domEventData.changedTouches[0];
    this.aimSelect(
      currentTouch.clientX,
      currentTouch.clientY,
    )
  };

  private onTouchEnd = (domEventData: TouchEvent): void => {
    domEventData.preventDefault();
    const currentTouch = domEventData.changedTouches[0];
    this.triggerSelect(
      currentTouch.clientX,
      currentTouch.clientY,
      domEventData
    );
  };

  private aimSelect(
    x: number,
    y: number,
  ): void {
    if(this.selectListeners.length == 0) return;

    // @ts-ignore
    if (app.display) {
      // @ts-ignore
      x *= app.display.scale;
      // @ts-ignore
      y *= app.display.scale;
    }

    for (let iter = 0; iter < this.selectListeners.length; iter++) {
      const eachListener = this.selectListeners[iter];
      const target = eachListener.target;
      if (target instanceof DisplayObject) {
        if (EventManager.isInTarget(target, x, y)) {
          this.pressedAtTarget.push(target);
        }
      }
    }
  }

  private triggerSelect(
    x: number,
    y: number,
    domEventData: MouseEvent | TouchEvent
  ): void {
    if(this.selectListeners.length == 0) return;

    // @ts-ignore
    if (app.display) {
      // @ts-ignore
      x *= app.display.scale;
      // @ts-ignore
      y *= app.display.scale;
    }

    const eventData: PointingEventData = {
      type: EventTypes.TOUCH_START,
      x: x,
      y: y,
      velocityX: 0,
      velocityY: 0,
      scrollX: 0,
      scrollY: 0,
      dragging: false,
      withALT: domEventData.altKey,
      withCTRL: domEventData.ctrlKey,
      withShift: domEventData.shiftKey,
    };

    for (let iter = 0; iter < this.selectListeners.length; iter++) {
      const eachListener = this.selectListeners[iter];
      const target = eachListener.target;
      if (target instanceof DisplayObject) {
        if (EventManager.isInTarget(target, x, y) && this.pressedAtTarget.includes(target)) {
          eachListener.func.call(target, { ...eventData, target: target });
        }
      }
    }

    this.pressedAtTarget = [];
  }
}
