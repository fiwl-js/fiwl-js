import InstructTemplate from "../templates/InstructTemplate";

// @fiwl-name rotate

export default class RotateInstruct implements InstructTemplate {
    public target:InstructTemplate;
    public angle:number;
    public x:number;
    public y:number;
    public width:number;
    public height:number;

    constructor(target:InstructTemplate, angle:number, x:number = 0, y:number = 0, width:number = NaN, height:number = NaN) {
        this.target = target;
        this.angle = angle;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(context:CanvasRenderingContext2D) {
        const pivotX:number = isNaN(this.width) ? this.x : (this.x + (this.width/2));
        const pivotY:number = isNaN(this.height) ? this.y : (this.y + (this.height/2));

        context.translate(pivotX, pivotY);
        context.rotate(this.angle * Math.PI / 180);
        context.translate(-pivotX, -pivotY);

        this.target.render(context);
    }
}