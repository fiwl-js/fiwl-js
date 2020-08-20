import { EventTypes } from "../EventTypesEnum";
import DisplayObject from "../../widgets/DisplayObject";

export default interface DataTemplate {
    type:EventTypes;
    target?:DisplayObject;
}