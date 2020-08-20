import PointingEventData from "./PointingEventData";

export default interface MouseEventData extends PointingEventData {
    pressingLeft:boolean;
    pressingMiddle:boolean;
    pressingRight:boolean;
}