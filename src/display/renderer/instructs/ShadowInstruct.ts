import InstructTemplate from "../templates/InstructTemplate";
import {hexToCSS} from "../RenderToolkit";

// @fiwl-name shadow

export default class ShadowInstruct implements InstructTemplate {
    public target:InstructTemplate;
    public colorHex:number;
    public blur:number;
    public offsetX:number;
    public offsetY:number;

    constructor(target:InstructTemplate, colorHex:number, blur:number, offsetX:number, offsetY:number) {
        this.target = target;
        this.colorHex = colorHex;
        this.blur = blur;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    render(context:CanvasRenderingContext2D) {
        context.shadowColor = hexToCSS(this.colorHex);
        context.shadowBlur = this.blur;
        context.shadowOffsetX = this.offsetX;
        context.shadowOffsetY = this.offsetY;

        this.target.render(context);
    }
}