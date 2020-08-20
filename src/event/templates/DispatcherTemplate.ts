import ListenerTemplate from "./ListenerTemplate";
import { EventTypes } from "../EventTypesEnum";

export default interface DispatcherTemplate {
    attach:(viewportInstance:HTMLCanvasElement, listenerMap:Map<EventTypes, ListenerTemplate[]>) => void;
    start:() => void;
    stop:() => void;
}