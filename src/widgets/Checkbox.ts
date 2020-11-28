import { EventTypes } from "../event/EventTypesEnum";
import MouseEventData from "../event/data/MouseEventData";
import RenderAPI from "../display/renderer/RenderAPI";
import DisplayObject from "./DisplayObject";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";
import StrokePathInstruct from "../display/renderer/instructs/StrokePathInstruct";
import VertexTemplate from "../display/renderer/templates/VertexTemplate";

export default class Checkbox extends DisplayObject {
  public checked = false;
  public tickSize = "5dp";

  constructor() {
    super();
    this.height = "35px";
    this.width = "35px";
    this.backgroundColor = app.res.style.onSecondaryColor;
  }

  draw(api: RenderAPI): InstructTemplate[] {
    let instructs = this.drawBackground(api);

    let checkBox = api.lineRect(
      this.globalX,
      this.globalY,
      this.measuredHeight,
      this.measuredWidth,
      app.colors.black,
      2
    );
    instructs.push(checkBox);

    let vertices: VertexTemplate[] = [
      {x: this.globalX, y: this.globalY + (this.measuredHeight/2)},
      {x: this.globalX + (this.measuredWidth/4), y: this.globalY + this.measuredHeight},
      {x: this.globalX + this.measuredWidth, y: this.globalY}
    ]
    if (this.checked) {
      let check = api.linePath(
        app.colors.blue,
        vertices,
        app.unit.resolve(this.tickSize)
      )
      instructs.push(check);
    }

    return this.drawPostEffect(api, instructs);
  }

  ready(): void {
    // On click change the checked mark
    this.addEventListener(EventTypes.SELECT, (eventData: MouseEventData) => {
      this.checked = !this.checked;
    });
  }
}
