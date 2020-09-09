import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name transparency

export default class TransparencyInstruct implements InstructTemplate {
  public target: InstructTemplate;
  public alpha: number;

  constructor(target: InstructTemplate, alpha: number) {
    this.target = target;
    this.alpha = alpha;
  }

  render(context: CanvasRenderingContext2D) {
    context.globalAlpha = this.alpha;
    this.target.render(context);
  }
}
