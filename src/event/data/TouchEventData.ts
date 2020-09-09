import PointingEventData from "./PointingEventData";
import FingerPointTemplate from "../templates/FingerPointTemplate";

export default interface TouchEventData extends PointingEventData {
  width: number;
  height: number;
  pressure: number;
  id: number;
  count: number;
  fingers: FingerPointTemplate[];
  zoom: number;
  rotate: number;
}
