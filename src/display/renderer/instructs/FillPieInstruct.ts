import InstructTemplate from '../templates/InstructTemplate';
import {hexToCSS} from "../RenderToolkit";

// @fiwl-name pie

export default class FillPieInstruct implements InstructTemplate {
    public x:number;
    public y:number;
    public radius:number;
    public colorHex:number;
    public startAngle:number;
    public endAngle:number;
    public isCounterClockwise:boolean;

    constructor(x:number, y:number, radius:number, colorHex:number, startAngle:number, endAngle:number, isCounterClockwise:boolean = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colorHex = colorHex;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.isCounterClockwise = isCounterClockwise;
    }

    render(context:CanvasRenderingContext2D) {
        /** @todo Complete this! */
    }
}