import Label from "./Label";
import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";

export default class Checkbox extends Label {
  public checked = false;

  constructor() {
    super();
    this.height = "35px";
    this.width = "35px";
    this.backgroundColor = app.res.style.onSecondaryColor;
    this.borderColor = app.res.style.textColor;
    this.borderSize = '2px';
    this.textSize = "35dp";
    this.alignText = "center";
  }

  ready(): void {
    // On click change the checked mark
    this.addEventListener(
      EventTypes.SELECT,
      (eventData: MouseEventData) => {
        this.checked = !this.checked;
        if (this.checked) this.text = '✔️';
        else {
          this.text = '';
          this.backgroundColor = app.res.style.onSecondaryColor;
        }
      }
    );
  }
}
