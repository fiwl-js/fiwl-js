import DataTemplate from "../templates/DataTemplate";

export default interface ScreenEventData extends DataTemplate {
  width: number;
  height: number;
  orientation: "landscape" | "potrait";
  scale: number;
}
