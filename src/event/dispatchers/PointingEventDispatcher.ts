import DispatcherTemplate from "../templates/DispatcherTemplate";
import { EventTypes } from "../EventTypesEnum";
import ListenerTemplate from "../templates/ListenerTemplate";
import EventManager from "../EventManager";
import PointingEventData from "../data/PointingEventData";
import DisplayObject from "../../widgets/DisplayObject";

export default class PointingEventDispatcher implements DispatcherTemplate {
    private viewportInstance:HTMLCanvasElement;

    private selectListeners:ListenerTemplate[];
    //private doubleListeners:ListenerTemplate[];
    //private optionListeners:ListenerTemplate[];
    //private scrollListeners:ListenerTemplate[];
    //private dragStartListeners:ListenerTemplate[];
    //private dragMoveListeners:ListenerTemplate[];
    //private dragEndListeners:ListenerTemplate[];

    attach(viewportInstance:HTMLCanvasElement, listenerMap:Map<EventTypes, ListenerTemplate[]>):void {
        this.viewportInstance = viewportInstance;
        this.selectListeners = listenerMap.get(EventTypes.SELECT);
        //this.doubleListeners = listenerMap.get(EventTypes.DOUBLE);
        //this.optionListeners = listenerMap.get(EventTypes.OPTION);
        //this.scrollListeners = listenerMap.get(EventTypes.SCROLL);
        //this.dragStartListeners = listenerMap.get(EventTypes.DRAG_START);
        //this.dragMoveListeners = listenerMap.get(EventTypes.DRAG_MOVE);
        //this.dragEndListeners = listenerMap.get(EventTypes.DRAG_END);
    }

    start():void {
        this.viewportInstance.addEventListener('mouseup', this.onMouseRelease);
        this.viewportInstance.addEventListener('touchend', this.onTouchEnd);
    }

    stop():void {
        this.viewportInstance.removeEventListener('mouseup', this.onMouseRelease);
        this.viewportInstance.removeEventListener('touchend', this.onTouchEnd);
    }

    private onMouseRelease = (domEventData:MouseEvent):void => {
        if(domEventData.button != 0) return;
        this.triggerSelect(domEventData.clientX, domEventData.clientY, domEventData);
    }

    private onTouchEnd = (domEventData:TouchEvent):void => {
        domEventData.preventDefault();
        const currentTouch = domEventData.changedTouches[0];
        this.triggerSelect(currentTouch.clientX, currentTouch.clientY, domEventData);
    }

    private triggerSelect(x:number, y:number, domEventData:MouseEvent|TouchEvent):void {
        if(this.triggerSelect.length == 0) return;

        if(app.display) {
            x *= app.display.scale;
            y *= app.display.scale;
        }
        
        const eventData:PointingEventData = {
            'type'      : EventTypes.TOUCH_START,
            'x'         : x,
            'y'         : y,
            'velocityX' : 0,
            'velocityY' : 0,
            'scrollX'   : 0,
            'scrollY'   : 0,
            'dragging'  : false,
            'withALT'   : domEventData.altKey,
            'withCTRL'  : domEventData.ctrlKey,
            'withShift' : domEventData.shiftKey
        }

        for(let iter = 0; iter < this.selectListeners.length; iter++) {
            const eachListener = this.selectListeners[iter];
            const target = eachListener.target;
            if(target instanceof DisplayObject) {
                if(EventManager.isInTarget(target, x, y)) {
                    eachListener.func.call(target, {...eventData, 'target' : target});
                }
            } else {
                eachListener.func({...eventData});
            }
        }
    }
}