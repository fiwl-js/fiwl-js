import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name bitmap

export default class DrawBitmapInstruct implements InstructTemplate {
  public bitmap: ImageBitmap;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(
    bitmap: ImageBitmap,
    x: number,
    y: number,
    width: number = NaN,
    height: number = NaN
  ) {
    this.bitmap = bitmap;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(context: CanvasRenderingContext2D) {
    if (isNaN(this.width) && isNaN(this.height)) {
      context.drawImage(this.bitmap, this.x, this.y);
    } else {
      context.drawImage(this.bitmap, this.x, this.y, this.width, this.height);
    }
  }
}
