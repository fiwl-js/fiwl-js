import InstructTemplate from '../templates/InstructTemplate';

// @fiwl-name crop

export default class CropInstruct implements InstructTemplate {
    public target:InstructTemplate;
    public x:number;
    public y:number;
    public width:number;
    public height:number;

    constructor(target:InstructTemplate, x:number, y:number, width:number, height:number) {
        this.target = target;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(context:CanvasRenderingContext2D) {
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.clip();

        // Context clean-up
        context.closePath();
        context.fillStyle = '';

        this.target.render(context);
    }
}