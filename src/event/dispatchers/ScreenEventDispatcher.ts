import DispatcherTemplate from "../templates/DispatcherTemplate";
import { EventTypes } from "../EventTypesEnum";
import ListenerTemplate from "../templates/ListenerTemplate";
import ScreenEventData from "../data/ScreenEventData";

export default class ScreenEventDispatcher implements DispatcherTemplate {
    private viewportInstance:HTMLCanvasElement;
    private resizeListeners:ListenerTemplate[];
    
    attach(viewportInstance:HTMLCanvasElement, listenerMap:Map<EventTypes, ListenerTemplate[]>):void {
        this.viewportInstance = viewportInstance;
        this.resizeListeners = listenerMap.get(EventTypes.SCREEN_RESIZE);
    }

    start():void {
        this.viewportInstance.addEventListener('resize', this.triggerResize);
    }

    stop():void {
        this.viewportInstance.removeEventListener('resize', this.triggerResize);
    }

    private triggerResize = () => {
        let eventData:ScreenEventData;
        if(app.display) {
            eventData = {
                'type'        : EventTypes.SCREEN_RESIZE,
                'width'       : app.display.width,
                'height'      : app.display.height,
                'scale'       : app.display.scale,
                'orientation' : app.display.isLandscape ? 'landscape' : 'potrait'
            }
        } else {
            eventData = {
                'type'        : EventTypes.SCREEN_RESIZE,
                'width'       : 0,
                'height'      : 0,
                'scale'       : 0,
                'orientation' : 'landscape'
            }
        }

        for(let iter = 0; iter < this.resizeListeners.length; iter++) {
            const eachListener = this.resizeListeners[iter];
            eachListener.func({...eventData, 'target' : eachListener.target});
        }
    }
}