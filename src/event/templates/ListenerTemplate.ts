import DisplayObject from "../../widgets/DisplayObject";
import DataTemplate from "./DataTemplate";

export default interface ListenerTemplate {
    func:(eventData:DataTemplate) => void;
    target?:DisplayObject;
}