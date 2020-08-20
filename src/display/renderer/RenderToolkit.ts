// This file stores functions that will be used multiple times for Rendering


/** Convert FIWL-standard color data (0xTTRRGGBBAA) to CSS standard for canvas element */
export function hexToCSS(colorHex:number):string {
    colorHex = colorHex >>> 0;
    if(Number.isNaN(colorHex)) {
        throw new TypeError(`"${colorHex}" is not a valid color!`);
    }
    if(colorHex < 0 || colorHex > 0xffffffff) {
        throw new TypeError(`#${colorHex.toString(16)} is not a valid color!`);
    }
    let red = (colorHex >> 16) & 0xff;
    let green = (colorHex >> 8) & 0xff;
    let blue = colorHex & 0xff;
    let alpha = (0xff - ((colorHex >> 24) & 0xff)) / 0xff;
    return `rgba(${red},${green},${blue},${alpha})`;
}


/** Canvas API expects radian, but FIWL uses degrees. So this will helps */
export function degreeToRadian(degree:number):number {
    return degree * (Math.PI / 180);
}