import InstructTemplate from "../templates/InstructTemplate";
import { hexToCSS } from "../RenderToolkit";

// @fiwl-name linePie

export default class StrokePieInstruct implements InstructTemplate {
  public x: number;
  public y: number;
  public radius: number;
  public colorHex: number;
  public startAngle: number;
  public endAngle: number;
  public thickness: number;
  public isCounterClockwise: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    colorHex: number,
    startAngle: number,
    endAngle: number,
    thickness: number = 1,
    isCounterClockwise: boolean = false
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colorHex = colorHex;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.thickness = thickness;
    this.isCounterClockwise = isCounterClockwise;
  }

  render(context: CanvasRenderingContext2D) {
    /** @todo Complete this! */
  }
}
