/** For creating path */
export default interface VertexTemplate {
    x:number;
    y:number;

    /** Bezier will be ignored if true */
    smooth?:boolean;

    prevBezierX?:number;
    prevBezierY?:number;
    nextBezierX?:number;
    nextBezierY?:number;

    // Only work for drawing strokes:
    color?:number;
    thickness?:number;
}