import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name scale

export default class ScaleInstruct implements InstructTemplate {
  public target: InstructTemplate;
  public scaleX: number;
  public scaleY: number;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(
    target: InstructTemplate,
    scaleX: number,
    scaleY: number,
    x: number = 0,
    y: number = 0,
    width: number = NaN,
    height: number = NaN
  ) {
    this.target = target;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(context: CanvasRenderingContext2D) {
    const pivotX = isNaN(this.width) ? this.x : this.x + this.width / 2;
    const pivotY = isNaN(this.height) ? this.y : this.y + this.height / 2;

    context.translate(pivotX, pivotY);
    context.scale(this.scaleX, this.scaleY);
    context.translate(-pivotX, -pivotY);

    this.target.render(context);
  }
}
