import InstructTemplate from '../templates/InstructTemplate';
import VertexTemplate from '../templates/VertexTemplate';
import {hexToCSS} from "../RenderToolkit";

// @fiwl-name linePath

export default class StrokePathInstruct implements InstructTemplate {
    public colorHex:number;
    public vertices:Array<VertexTemplate>;
    public thickness:number;
    public x:number;
    public y:number;
    public width:number;
    public height:number;

    constructor(colorHex:number, vertices:Array<VertexTemplate>, thickness:number = 1, x:number = 0, y:number = 0, width:number = NaN, height:number = NaN) {
        this.colorHex = colorHex;
        this.vertices = vertices;
        this.thickness = thickness;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(context:CanvasRenderingContext2D) {
        if(this.vertices.length <= 0) return;

        let scaleX = 1;
        if(!isNaN(this.width)) {
            scaleX = this.width / this.widthOrigin;
        }

        let scaleY = 1;
        if(!isNaN(this.height)) {
            scaleY = this.height / this.heightOrigin;
        }

        context.strokeStyle = hexToCSS(this.colorHex);
        context.lineJoin = 'round';
        context.lineCap = 'round';

        const first = this.vertices[0];
        context.beginPath();
        context.lineWidth = (isNaN(first.thickness)) ? this.thickness : first.thickness;
        context.moveTo(first.x, first.y);
        /** @todo Need help for implementing dynamic path colors */
        for(let iter = 1; iter < this.vertices.length; iter++) {
            const prevVertex = this.vertices[iter-1];
            const currentVertex = this.vertices[iter];
            if(currentVertex.smooth === true) {
                /** @todo Better path smoothing algorithm is needed */
                if(iter < this.vertices.length-1) {
                    const nextVertex = this.vertices[iter+1];
                    context.lineWidth = (isNaN(nextVertex.thickness)) ? this.thickness : nextVertex.thickness;
                    context.quadraticCurveTo(
                        this.x + (currentVertex.x * scaleX),
                        this.y + (currentVertex.y * scaleY),
                        this.x + (nextVertex.x * scaleX),
                        this.y + (nextVertex.y * scaleY)
                    );
                    iter++;
                } else {
                    const x1 = this.x + (prevVertex.x * scaleX);
                    const y1 = this.y + (prevVertex.y * scaleY);
                    const x2 = this.x + (currentVertex.x * scaleX);
                    const y2 = this.y + (currentVertex.y * scaleY);
                    const distance = Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
                    context.lineWidth = (isNaN(currentVertex.thickness)) ? this.thickness : currentVertex.thickness;
                    context.arcTo(
                        x1, y1, x2, y2,
                        distance / 2
                    );
                }
            } else {
                context.lineWidth = (isNaN(currentVertex.thickness)) ? this.thickness : currentVertex.thickness;
                const isBezier = !isNaN(prevVertex.nextBezierX) || !isNaN(prevVertex.nextBezierY)
                    || !isNaN(currentVertex.prevBezierX) || !isNaN(currentVertex.prevBezierY);
                if(isBezier) {
                    let cp1x = isNaN(prevVertex.nextBezierX) ? prevVertex.x : prevVertex.nextBezierX;
                    let cp1y = isNaN(prevVertex.nextBezierY) ? prevVertex.y : prevVertex.nextBezierY;
                    let cp2x = isNaN(currentVertex.prevBezierX) ? currentVertex.x : currentVertex.prevBezierX;
                    let cp2y = isNaN(currentVertex.prevBezierY) ? currentVertex.y : currentVertex.prevBezierY;
                    cp1x = this.x + (cp1x * scaleX);
                    cp1y = this.y + (cp1y * scaleY);
                    cp2x = this.x + (cp2x * scaleX);
                    cp2y = this.y + (cp2y * scaleY);
                    const endX = this.x + (currentVertex.x * scaleX);
                    const endY = this.y + (currentVertex.y * scaleY);
                    context.bezierCurveTo(
                        cp1x, cp1y, cp2x, cp2y, endX, endY
                    );
                } else {
                    context.lineTo(
                        this.x + (currentVertex.x * scaleX),
                        this.y + (currentVertex.y * scaleY)
                    );
                }
            }
        }
        context.stroke();
        context.closePath();
    }

    private get widthOrigin():number {
        let min:number = 0;
        let max:number = 0;

        for(let iter = 0; iter < this.vertices.length; iter++) {
            const eachPoint = this.vertices[iter];
            min = Math.min(min, eachPoint.x);
            max = Math.max(max, eachPoint.x);
        }

        return max - min;
    }

    private get heightOrigin():number {
        let min:number = 0;
        let max:number = 0;

        for(let iter = 0; iter < this.vertices.length; iter++) {
            const eachPoint = this.vertices[iter];
            min = Math.min(min, eachPoint.y);
            max = Math.max(max, eachPoint.y);
        }

        return max - min;
    }
}