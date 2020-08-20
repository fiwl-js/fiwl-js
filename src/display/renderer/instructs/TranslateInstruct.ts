import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name translate

export default class TranslateInstruct implements InstructTemplate {
    public target:InstructTemplate;
    public deltaX:number;
    public deltaY:number;

    constructor(target:InstructTemplate, deltaX:number, deltaY:number) {
        this.target = target;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
    }

    render(context:CanvasRenderingContext2D) {
        context.translate(this.deltaX, this.deltaY);
        this.target.render(context);
    }
}