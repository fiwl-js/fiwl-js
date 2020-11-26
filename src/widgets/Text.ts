import Label from "./Label";
import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";


export default class Text extends Label {
  constructor() {
    super();
    this.alignText = "center";
    this.textColor = app.res.style.textColor;
  }

  ready(): void {
    // Change cursor on hover:
    this.addEventListener(
      EventTypes.MOUSE_HOVER_START,
      (eventData: MouseEventData) => {
        app.display.setCursor("text");
      }
    );
    this.addEventListener(
      EventTypes.MOUSE_HOVER_END,
      (eventData: MouseEventData) => {
        app.display.setCursor("default");
      }
    );
    this.addEventListener(
      EventTypes.SELECT, 
      (eventData: MouseEventData) => {
        this.backgroundColor = app.res.style.stageBackgroundColor;
      }
    );
  }
}
