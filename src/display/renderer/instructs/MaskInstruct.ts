import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name mask

export default class MaskInstruct implements InstructTemplate {
  public target: InstructTemplate;
  public mask: InstructTemplate;
  public allowIntersectCut: boolean;

  constructor(
    target: InstructTemplate,
    mask: InstructTemplate,
    allowIntersectCut: boolean = false
  ) {
    this.target = target;
    this.mask = mask;
    this.allowIntersectCut = allowIntersectCut;
  }

  render(context: CanvasRenderingContext2D) {
    this.mask.render(context);
    const clipRule = this.allowIntersectCut ? "evenodd" : "nonzero";
    context.clip(clipRule);
    this.target.render(context);
  }
}
