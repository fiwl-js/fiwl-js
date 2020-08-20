import InstructTemplate from '../templates/InstructTemplate';
import { degreeToRadian } from '../RenderToolkit';

// @fiwl-name elevate

export default class ElevateInstruct implements InstructTemplate {
    public target:InstructTemplate;
    public elevation:number;
    public angle:number;

    constructor(target:InstructTemplate, elevation:number, angle:number = 0) {
        this.target = target;
        this.elevation = elevation;
        this.angle = angle;
    }

    render(context:CanvasRenderingContext2D) {
        context.shadowColor = 'rgba(0,0,0,0.5)';
        context.shadowBlur = this.elevation + 1;
        
        const radian:number = degreeToRadian(this.angle);
        const offset:number = (this.elevation + 1) * 0.5;
        context.shadowOffsetX = Math.sin(radian/2) * offset;
        context.shadowOffsetY = Math.abs(Math.cos(radian) * offset);

        this.target.render(context);
    }
}