import InstructTemplate from "../templates/InstructTemplate";
import {hexToCSS} from '../RenderToolkit';

// @fiwl-name lineRect

export default class StrokeRectangleInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public colorHex:number;
    public thickness:number;

    public constructor(x:number, y:number, width:number, height:number, colorHex:number, thickness:number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colorHex = colorHex;
        this.thickness = thickness;
    }

    public render(context:CanvasRenderingContext2D):void {
        context.lineWidth = this.thickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = hexToCSS(this.colorHex);
        context.strokeRect(this.x, this.y, this.width, this.height);
    }
}