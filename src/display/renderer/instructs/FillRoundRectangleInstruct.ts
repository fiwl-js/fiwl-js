import InstructTemplate from '../templates/InstructTemplate';
import {hexToCSS} from '../RenderToolkit';

// @fiwl-name roundRect

export default class FillRoundRectangleInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public width:number;
    public height:number;
    public colorHex:number;
    public cornerRadius:number;
    
    constructor(x:number, y:number, width:number, height:number, colorHex:number, cornerRadius:number = 16) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colorHex = colorHex;
        this.cornerRadius = cornerRadius;
    }

    render(context:CanvasRenderingContext2D) {
        this.cornerRadius = Math.min(this.cornerRadius, this.width/2, this.height/2);
        context.fillStyle = hexToCSS(this.colorHex);

        context.beginPath();
        context.moveTo(this.x + this.cornerRadius, this.y);
        context.lineTo(this.x + this.width - this.cornerRadius, this.y);
        context.quadraticCurveTo(
            this.x + this.width, this.y,
            this.x + this.width, this.y + this.cornerRadius
        );
        context.lineTo(this.x + this.width, this.y + this.height - this.cornerRadius);
        context.quadraticCurveTo(
            this.x + this.width, this.y + this.height,
            this.x + this.width - this.cornerRadius, this.y + this.height
        );
        context.lineTo(this.x + this.cornerRadius, this.y + this.height);
        context.quadraticCurveTo(
            this.x, this.y + this.height,
            this.x, this.y + this.height - this.cornerRadius
        );
        context.lineTo(this.x, this.y + this.cornerRadius);
        context.quadraticCurveTo(
            this.x, this.y,
            this.x + this.cornerRadius, this.y
        );
        context.closePath();
        context.fill();
    }
}