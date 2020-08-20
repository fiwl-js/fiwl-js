import InstructTemplate from '../templates/InstructTemplate';
import {hexToCSS, degreeToRadian} from '../RenderToolkit';

// @fiwl-name lineArc

export default class StrokeArcInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public radius:number;
    public colorHex:number;
    public startAngle:number;
    public endAngle:number;
    public thickness:number;
    public stretchRatio:number;
    public isCounterClockwise:boolean;
    
    constructor(x:number, y:number, radius:number, colorHex:number, startAngle:number, endAngle:number, thickness:number = 1, stretchRatio:number = 1, isCounterClockwise:boolean = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colorHex = colorHex;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.thickness = thickness;
        this.stretchRatio = stretchRatio;
        this.isCounterClockwise = isCounterClockwise;
    }

    render(context:CanvasRenderingContext2D) {
        const startRadian = degreeToRadian(this.startAngle);
        const endRadian = degreeToRadian(this.endAngle);
        const lengthAngle = Math.abs(endRadian - startRadian);
        const zeroAngle = 90 - (lengthAngle/2);
        context.lineWidth = this.thickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = hexToCSS(this.colorHex);
        context.beginPath();
        context.ellipse(
            this.x, this.y, this.radius * this.stretchRatio, this.radius, startRadian-zeroAngle, zeroAngle, zeroAngle + lengthAngle, this.isCounterClockwise
        );
        context.stroke();
        context.closePath();
    }
}