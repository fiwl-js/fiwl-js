import InstructTemplate from '../templates/InstructTemplate';
import {hexToCSS} from "../RenderToolkit";

// @fiwl-name ellipse

export default class FillEllipseInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public colorHex:number;

    constructor(x:number, y:number, width:number, height:number, colorHex:number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colorHex = colorHex;
    }

    render(context:CanvasRenderingContext2D) {
        context.fillStyle = hexToCSS(this.colorHex);
        context.beginPath();
        context.ellipse(
            this.x + (this.width/2), this.y + (this.height/2), this.width/2, this.height/2, 0, 0, Math.PI*2
        );
        context.closePath();
        context.fill();
    }
}