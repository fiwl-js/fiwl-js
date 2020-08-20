import ParamsTemplate from '../ParamsTemplate';
import { EventTypes } from "../../event/EventTypesEnum";
import DataTemplate from "../../event/templates/DataTemplate";
import EventManager from '../../event/EventManager';
import DisplayObject from '../../widgets/DisplayObject';

/** Access event management that able to handle DisplayObjects (and derivatives) as target */
export default interface EventInterface {
    /**
     *  Register a function as event listener
     *  
     *  @param type Intended event type, as example: "select", "option", "mouse-left-press", ...
     *  @param listener The function callback, will be called on event dispatch
     *  @param context Set listener's context, this will only allow event dispatcher to trigger when context in focus.
     */
    addEventListener:(type:EventTypes, listener:(eventData:DataTemplate) => void, context?:DisplayObject) => void;

    /**
     *  Unregister event listener. If not registered yet, then nothing happened.
     *  
     *  @param type Intended event type, as example: "select", "option", "mouse-left-press", ...
     *  @param listener The function callback, will be called on event dispatch
     *  @param context Set listener's context, this will only allow event dispatcher to trigger when context in focus.
     */
    removeEventListener:(type:EventTypes, listener:(eventData:DataTemplate) => void, context?:DisplayObject) => void;
}

export const name = 'event';

export const bind = async (params:ParamsTemplate):Promise<EventInterface> => {
    const dom = document.getElementById(params.domID);

    if(dom instanceof HTMLCanvasElement) {
        const viewportInstance:HTMLCanvasElement = dom;
        EventManager.attachDOM(viewportInstance);
    } else {
        throw new TypeError(`params#domID ("${params.domID}") expected HTMLCanvasElement not ` + dom.constructor.name);
    }

    const event:EventInterface = {
        'addEventListener'    : EventManager.addEventListener,
        'removeEventListener' : EventManager.removeEventListener
    };

    return Object.freeze(event);
}