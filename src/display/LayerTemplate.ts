import RenderAPI from './renderer/RenderAPI';
import InstructTemplate from './renderer/templates/InstructTemplate';

export default interface LayerTemplate {
    tag:string;
    drawFunc:(api:RenderAPI) => Array<InstructTemplate>;
    objectContext:Object;
    x:number;
    y:number;
    alpha:number;
    scaleX:number;
    scaleY:number;
}