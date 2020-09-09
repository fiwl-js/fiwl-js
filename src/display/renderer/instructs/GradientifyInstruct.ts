import InstructTemplate from "../templates/InstructTemplate";
import GradientPointTemplate from "../templates/GradientPointTemplate";
import { hexToCSS } from "../RenderToolkit";

// @fiwl-name gradientify

export default class GradientifyInstruct implements InstructTemplate {
  public target: InstructTemplate;
  public startX: number;
  public startY: number;
  public endX: number;
  public endY: number;
  public gradientPoints: Array<GradientPointTemplate>;
  public isRadial: boolean;

  constructor(
    target: InstructTemplate,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    gradientPoints: Array<GradientPointTemplate>,
    isRadial: boolean = false
  ) {
    this.target = target;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.gradientPoints = gradientPoints;
    this.isRadial = isRadial;
  }

  render(context: CanvasRenderingContext2D) {
    let gradient: CanvasGradient;
    if (this.isRadial) {
      const radius = Math.sqrt(
        (this.endX - this.startX) ** 2 + (this.endY - this.startY) ** 2
      );
      gradient = context.createRadialGradient(
        this.startX,
        this.startY,
        0,
        this.startX,
        this.startY,
        radius
      );
    } else {
      gradient = context.createLinearGradient(
        this.startX,
        this.startY,
        this.endX,
        this.endY
      );
    }
    for (let iter = 0; iter < this.gradientPoints.length; iter++) {
      const eachPoint = this.gradientPoints[iter];
      gradient.addColorStop(eachPoint.index, hexToCSS(eachPoint.colorHex));
    }
    context.globalCompositeOperation = "destination-in";
    this.target.render(context);
  }
}
