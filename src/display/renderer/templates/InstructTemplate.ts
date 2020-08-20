/** All render instructions (they're inside "./instructs" directory) must implement this */
export default interface InstructTemplate {
    render:(context:CanvasRenderingContext2D) => void;
}