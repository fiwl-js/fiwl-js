/** Put this in an Array for representing gradient color */
export default interface GradientPointTemplate {
    /** In fraction of number, 0.0 - 1.0 */
    index:number;

    /** Color with 0xTTRRGGBB hex format */
    colorHex:number;
}