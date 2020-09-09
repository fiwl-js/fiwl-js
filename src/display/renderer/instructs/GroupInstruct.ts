import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name group

export default class GroupInstruct implements InstructTemplate {
  public instructions: Array<InstructTemplate>;

  constructor(instructions: Array<InstructTemplate>) {
    this.instructions = instructions;
  }

  render(context: CanvasRenderingContext2D) {
    for (let iter = 0; iter < this.instructions.length; iter++) {
      context.save();
      this.instructions[iter].render(context);
      context.restore();
    }
  }
}
