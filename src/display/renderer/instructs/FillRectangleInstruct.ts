import InstructTemplate from "../templates/InstructTemplate";
import {hexToCSS} from '../RenderToolkit';

// @fiwl-name rect

export default class FillRectangleInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public colorHex:number;

    public constructor(x:number, y:number, width:number, height:number, colorHex:number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colorHex = colorHex;
    }

    public render(context:CanvasRenderingContext2D):void {
        context.fillStyle = hexToCSS(this.colorHex);
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}