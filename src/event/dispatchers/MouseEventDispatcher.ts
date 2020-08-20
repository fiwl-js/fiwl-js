import DispatcherTemplate from "../templates/DispatcherTemplate";
import { EventTypes } from "../EventTypesEnum";
import ListenerTemplate from "../templates/ListenerTemplate";
import MouseEventData from "../data/MouseEventData";
import EventManager from "../EventManager";
import DisplayObject from "../../widgets/DisplayObject";

export default class MouseEventDispatcher implements DispatcherTemplate {
    private viewportInstance:HTMLCanvasElement;

    private leftPressListeners:ListenerTemplate[];
    private leftDoubleListeners:ListenerTemplate[];
    private leftReleaseListeners:ListenerTemplate[];
    private middlePressListeners:ListenerTemplate[];
    private middleDoubleListeners:ListenerTemplate[];
    private middleReleaseListeners:ListenerTemplate[];
    private rightPressListeners:ListenerTemplate[];
    private rightDoubleListeners:ListenerTemplate[];
    private rightReleaseListeners:ListenerTemplate[];
    private hoverStartListeners:ListenerTemplate[];
    private hoverEndListeners:ListenerTemplate[];
    private moveListeners:ListenerTemplate[];
    private scrollListeners:ListenerTemplate[];

    private pressingLeft:boolean = false;
    private pressingMiddle:boolean = false;
    private pressingRight:boolean = false;

    private lastX:number = NaN;
    private lastY:number = NaN;

    private doubleLeftHandler:number = NaN;
    private doubleMiddleHandler:number = NaN;
    private doubleRightHandler:number = NaN;

    private hoverTarget:DisplayObject = null;

    private dragging:boolean = false;

    attach(viewportInstance:HTMLCanvasElement, listenerMap:Map<EventTypes, ListenerTemplate[]>):void {
        this.viewportInstance = viewportInstance;
        this.leftPressListeners = listenerMap.get(EventTypes.MOUSE_LEFT_PRESS);
        this.leftDoubleListeners = listenerMap.get(EventTypes.MOUSE_LEFT_DOUBLE);
        this.leftReleaseListeners = listenerMap.get(EventTypes.MOUSE_LEFT_RELEASE);
        this.middlePressListeners = listenerMap.get(EventTypes.MOUSE_MIDDLE_PRESS);
        this.middleDoubleListeners = listenerMap.get(EventTypes.MOUSE_MIDDLE_DOUBLE);
        this.middleReleaseListeners = listenerMap.get(EventTypes.MOUSE_MIDDLE_RELEASE);
        this.rightPressListeners = listenerMap.get(EventTypes.MOUSE_RIGHT_PRESS);
        this.rightDoubleListeners = listenerMap.get(EventTypes.MOUSE_RIGHT_DOUBLE);
        this.rightReleaseListeners = listenerMap.get(EventTypes.MOUSE_RIGHT_RELEASE);
        this.hoverStartListeners = listenerMap.get(EventTypes.MOUSE_HOVER_START);
        this.hoverEndListeners = listenerMap.get(EventTypes.MOUSE_HOVER_END);
        this.moveListeners = listenerMap.get(EventTypes.MOUSE_MOVE);
        this.scrollListeners = listenerMap.get(EventTypes.MOUSE_SCROLL);
    }

    start():void {
        this.viewportInstance.addEventListener('mousedown', this.triggerPress);
        this.viewportInstance.addEventListener('mousemove', this.triggerMove);
        this.viewportInstance.addEventListener('mouseup', this.triggerRelease);
        this.viewportInstance.addEventListener('wheel', this.triggerScroll);
    }

    stop():void {
        this.viewportInstance.removeEventListener('mousedown', this.triggerPress);
        this.viewportInstance.removeEventListener('mousemove', this.triggerMove);
        this.viewportInstance.removeEventListener('mouseup', this.triggerRelease);
        this.viewportInstance.removeEventListener('wheel', this.triggerScroll);
    }

    private triggerPress = (domEventData:MouseEvent):void => {
        this.updateButtonState(domEventData.buttons);

        let type:EventTypes;
        let listeners:ListenerTemplate[];
        switch(domEventData.button) {
            case 0:
                type = EventTypes.MOUSE_LEFT_PRESS;
                listeners = this.leftPressListeners;
            break;
            case 1:
                type = EventTypes.MOUSE_MIDDLE_PRESS;
                listeners = this.middlePressListeners;
            break;
            case 2:
                type = EventTypes.MOUSE_RIGHT_PRESS;
                listeners = this.rightPressListeners;
            break;
            default: return;
        }

        if(listeners.length == 0) return;

        let posX = domEventData.clientX;
        let posY = domEventData.clientX;
        if(app.display) {
            posX *= app.display.scale;
            posY *= app.display.scale;
        }

        const eventData:MouseEventData = {
            'type'           : type,
            'x'              : posX,
            'y'              : posY,
            'velocityX'      : 0,
            'velocityY'      : 0,
            'scrollX'        : 0,
            'scrollY'        : 0,
            'pressingLeft'   : this.pressingLeft,
            'pressingMiddle' : this.pressingMiddle,
            'pressingRight'  : this.pressingRight,
            'dragging'       : this.dragging,
            'withALT'        : domEventData.altKey,
            'withCTRL'       : domEventData.ctrlKey,
            'withShift'      : domEventData.shiftKey
        };

        for(let iter = 0; iter < listeners.length; iter++) {
            const eachListener = listeners[iter];
            if(eachListener.target) {
                const target = eachListener.target;
                if(EventManager.isInTarget(target, posX, posY)) {
                    eachListener.func.call(target, {
                        ...eventData,
                        'target' : target
                    });
                }
            } else {
                eachListener.func({...eventData});
            }
        }
    };

    private triggerMove = (domEventData:MouseEvent):void => {
        let posX = domEventData.clientX;
        let posY = domEventData.clientY;
        if(app.display) {
            posX *= app.display.scale;
            posY *= app.display.scale;
        }

        let velocityX:number, velocityY:number;

        if(isNaN(this.lastX)) {
            this.lastX = posX;
            velocityX = 0;
        } else {
            velocityX = posX - this.lastX;
            this.lastX = posX;
        }

        if(isNaN(this.lastY)) {
            this.lastY = posY;
            velocityY = 0;
        } else {
            velocityY = posY - this.lastY;
            this.lastY = posY;
        }

        if(this.pressingLeft) this.dragging = true;

        if(this.moveListeners.length == 0 && this.hoverStartListeners.length == 0 && this.hoverEndListeners.length == 0) return;

        const eventData:MouseEventData = {
            'type'           : EventTypes.MOUSE_MOVE,
            'x'              : posX,
            'y'              : posY,
            'velocityX'      : velocityX,
            'velocityY'      : velocityY,
            'scrollX'        : 0,
            'scrollY'        : 0,
            'pressingLeft'   : this.pressingLeft,
            'pressingMiddle' : this.pressingMiddle,
            'pressingRight'  : this.pressingRight,
            'dragging'       : this.dragging,
            'withALT'        : domEventData.altKey,
            'withCTRL'       : domEventData.ctrlKey,
            'withShift'      : domEventData.shiftKey
        };

        // On mouse move:
        for(let iter = 0; iter < this.moveListeners.length; iter++) {
            const eachListener = this.moveListeners[iter];
            if(eachListener.target) {
                const target = eachListener.target;
                if(EventManager.isInTarget(target, posX, posY)) {
                    eachListener.func.call(target, {
                        ...eventData,
                        'target' : target
                    });
                }
            } else {
                eachListener.func({...eventData});
            }
        }

        // On start hover:
        let lastTarget:DisplayObject = null;
        for(let iter = 0; iter < this.hoverStartListeners.length; iter++) {
            const eachListener = this.hoverStartListeners[iter];
            const target:DisplayObject = eachListener.target;
            if(target instanceof DisplayObject) {
                if(EventManager.isInTarget(target, posX, posY)) {
                    if(target != this.hoverTarget) {
                        eachListener.func.call(target, {
                            ...eventData,
                            'type'   : EventTypes.MOUSE_HOVER_START,
                            'target' : target
                        });
                        lastTarget = this.hoverTarget;
                        this.hoverTarget = target;
                    }
                    break;
                } else if(this.hoverTarget != null) {
                    if(!EventManager.isInTarget(this.hoverTarget, posX, posY)) {
                        lastTarget = this.hoverTarget;
                        this.hoverTarget = null;
                        break;
                    }
                }
            }
        }

        if(lastTarget != null) {
            for(let iter = 0; iter < this.hoverEndListeners.length; iter++) {
                const eachListener = this.hoverEndListeners[iter];
                const target:DisplayObject = eachListener.target;
                if(!(target instanceof DisplayObject)) continue;
                if(target == lastTarget) {
                    eachListener.func.call(target, {
                        ...eventData,
                        'type'   : EventTypes.MOUSE_HOVER_START,
                        'target' : target
                    });
                }
            }
        }
    };

    private triggerRelease = (domEventData:MouseEvent):void => {
        this.updateButtonState(domEventData.buttons);

        let posX = domEventData.clientX;
        let posY = domEventData.clientX;
        if(app.display) {
            posX *= app.display.scale;
            posY *= app.display.scale;
        }

        let velocityX:number, velocityY:number;

        if(isNaN(this.lastX)) {
            this.lastX = posX;
            velocityX = 0;
        } else {
            velocityX = posX - this.lastX;
            this.lastX = posX;
        }

        if(isNaN(this.lastY)) {
            this.lastY = posY;
            velocityY = 0;
        } else {
            velocityY = posY - this.lastY;
            this.lastY = posY;
        }
        
        let type:EventTypes;
        let listeners:ListenerTemplate[];
        let doubleType:EventTypes = null;
        let doubleListeners:ListenerTemplate[] = null;
        switch(domEventData.button) {
            case 0: // Left button
                type = EventTypes.MOUSE_LEFT_RELEASE;
                listeners = this.leftReleaseListeners;
                this.dragging = false;
                if(isNaN(this.doubleLeftHandler)) {
                    this.doubleLeftHandler = window.setTimeout(() => {
                        this.doubleLeftHandler = NaN;
                    }, 500);
                } else {
                    window.clearTimeout(this.doubleLeftHandler);
                    this.doubleLeftHandler = NaN;
                    doubleType = EventTypes.MOUSE_LEFT_DOUBLE;
                    doubleListeners = this.leftDoubleListeners;
                }
            break;
            case 1: // Middle button
                type = EventTypes.MOUSE_MIDDLE_RELEASE;
                listeners = this.middleReleaseListeners;
                if(isNaN(this.doubleMiddleHandler)) {
                    this.doubleMiddleHandler = window.setTimeout(() => {
                        this.doubleMiddleHandler = NaN;
                    }, 500);
                } else {
                    window.clearTimeout(this.doubleMiddleHandler);
                    this.doubleMiddleHandler = NaN;
                    doubleType = EventTypes.MOUSE_MIDDLE_DOUBLE;
                    doubleListeners = this.middleDoubleListeners;
                }
            break;
            case 2: // Right button
                type = EventTypes.MOUSE_RIGHT_RELEASE;
                listeners = this.rightReleaseListeners;
                if(isNaN(this.doubleRightHandler)) {
                    this.doubleRightHandler = window.setTimeout(() => {
                        this.doubleRightHandler = NaN;
                    }, 500);
                } else {
                    window.clearTimeout(this.doubleRightHandler);
                    this.doubleRightHandler = NaN;
                    doubleType = EventTypes.MOUSE_RIGHT_DOUBLE;
                    doubleListeners = this.rightDoubleListeners;
                }
            break;
            default: return;
        }

        if(listeners.length == 0) return;

        const eventData:MouseEventData = {
            'type'           : type,
            'x'              : posX,
            'y'              : posY,
            'velocityX'      : velocityX,
            'velocityY'      : velocityY,
            'scrollX'        : 0,
            'scrollY'        : 0,
            'pressingLeft'   : this.pressingLeft,
            'pressingMiddle' : this.pressingMiddle,
            'pressingRight'  : this.pressingRight,
            'dragging'       : this.dragging,
            'withALT'        : domEventData.altKey,
            'withCTRL'       : domEventData.ctrlKey,
            'withShift'      : domEventData.shiftKey
        };

        for(let iter = 0; iter < listeners.length; iter++) {
            const eachListener = listeners[iter];
            if(eachListener.target) {
                const target = eachListener.target;
                if(EventManager.isInTarget(target, posX, posY)) {
                    eachListener.func.call(target, {
                        ...eventData,
                        'target' : target
                    });
                }
            } else {
                eachListener.func({...eventData});
            }
        }

        if(doubleType && doubleListeners) {
            for(let iter = 0; iter < doubleListeners.length; iter++) {
                const eachListener = doubleListeners[iter];
                if(eachListener.target) {
                    const target = eachListener.target;
                    if(EventManager.isInTarget(target, posX, posY)) {
                        eachListener.func.call(target, {
                            ...eventData,
                            'type'   : doubleType,
                            'target' : target
                        });
                    }
                } else {
                    eachListener.func({...eventData, 'type' : doubleType});
                }
            }
        }
    }

    private triggerScroll = (domEventData:WheelEvent):void => {
        if(this.scrollListeners.length == 0) return;

        let posX = domEventData.clientX;
        let posY = domEventData.clientX;
        if(app.display) {
            posX *= app.display.scale;
            posY *= app.display.scale;
        }

        const eventData:MouseEventData = {
            'type'           : EventTypes.MOUSE_MOVE,
            'x'              : posX,
            'y'              : posY,
            'velocityX'      : 0,
            'velocityY'      : 0,
            'scrollX'        : domEventData.deltaX,
            'scrollY'        : domEventData.deltaY,
            'pressingLeft'   : this.pressingLeft,
            'pressingMiddle' : this.pressingMiddle,
            'pressingRight'  : this.pressingRight,
            'dragging'       : this.dragging,
            'withALT'        : domEventData.altKey,
            'withCTRL'       : domEventData.ctrlKey,
            'withShift'      : domEventData.shiftKey
        };

        for(let iter = 0; iter < this.scrollListeners.length; iter++) {
            const eachListener = this.scrollListeners[iter];
            if(eachListener.target) {
                const target = eachListener.target;
                if(EventManager.isInTarget(target, posX, posY)) {
                    eachListener.func.call(target, {
                        ...eventData,
                        'target' : target
                    });
                }
            } else {
                eachListener.func({...eventData});
            }
        }
    };

    private updateButtonState(reg:number) {
        this.pressingLeft = (reg & 0b1) == 0b1;
        this.pressingRight = ((reg >> 1) & 0b1) == 0b1;
        this.pressingMiddle = ((reg >> 2) & 0b1) == 0b1;
    }
}