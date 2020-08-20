import ParamsTemplate from '../ParamsTemplate';

/**
 *  Provides nice and easy color palette.
 *  Courtesy Google Material Design.
 */
export default class ColorPreset {
    public redLight:number    = 0xFFCDD2;
    public red:number         = 0xF44336;
    public redDark:number     = 0xB71C1C;
    public pinkLight:number   = 0xF8BBD0;
    public pink:number        = 0xE91E63;
    public pinkDark:number    = 0x880E4F;
    public purpleLight:number = 0xE1BEE7;
    public purple:number      = 0x9C27B0;
    public purpleDark:number  = 0x4A148C;
    public indigoLight:number = 0xC5CAE9;
    public indigo:number      = 0x3F51B5;
    public indigoDark:number  = 0x1A237E;
    public blueLight:number   = 0xBBDEFB;
    public blue:number        = 0x2196F3;
    public blueDark:number    = 0x0D47A1;
    public cyanLight:number   = 0xB2EBF2;
    public cyan:number        = 0x00BCD4;
    public cyanDark:number    = 0x006064;
    public tealLight:number   = 0xB2DFDB;
    public teal:number        = 0x009688;
    public tealDark:number    = 0x004D40;
    public greenLight:number  = 0xC8E6C9;
    public green:number       = 0x4CAF50;
    public greenDark:number   = 0x1B5E20;
    public limeLight:number   = 0xF0F4C3;
    public lime:number        = 0xCDDC39;
    public limeDark:number    = 0x827717;
    public yellowLight:number = 0xFFF9C4;
    public yellow:number      = 0xFFEB3B;
    public yellowDark:number  = 0xF57F17;
    public amberLight:number  = 0xFFECB3;
    public amber:number       = 0xFFC107;
    public amberDark:number   = 0xFF6F00;
    public orangeLight:number = 0xFFF3E0;
    public orange:number      = 0xFF9800;
    public orangeDark:number  = 0xE65100;
    public brownLight:number  = 0xD7CCC8;
    public brown:number       = 0x795548;
    public brownDark:number   = 0x3E2723;
    public grayLight:number   = 0xF5F5F5;
    public gray:number        = 0x9E9E9E;
    public grayBlue:number    = 0x607D8B;
    public grayDark:number    = 0x212121;
    public white:number       = 0xffffff;
    public black:number       = 0x000000;
    public greyLight:number   = 0xF5F5F5;
    public grey:number        = 0x9E9E9E;
    public greyBlue:number    = 0x607D8B;
    public greyDark:number    = 0x212121;
    public transparent:number = 0xff000000;

    /** Convert another coloring system to FIWL-standard */
    public Convert:ColorConversion = {
        rgba    : (red:number, green:number, blue:number, alpha:number = 1):number => {
            let result = blue;
            result |= green << 8;
            result |= red << 16;
            result |= ((1 - alpha) * 0xff) << 24;
            return result >>> 0;
        },
        hexAlpha: (hex:number, alpha:number):number => {
            let result = (hex >>> 0) & 0xffffff;
            result |= ((1 - alpha) * 0xff) << 24;
            return result;
        }
    }
}

interface ColorConversion {
    /**
     *  Convert RGBA format into 0xTTRRGGBB hex
     *  
     *  @param {number} red 0 - 255
     *  @param {number} green 0 - 255
     *  @param {number} blue 0 - 255
     *  @param {number} alpha 0.0 - 1.0, default is 1.0
     *  @return {number} 0xTTRRGGBB hex color
     */
    rgba(red:number, green:number, blue:number, alpha?:number):number;

    /**
     *  Put alpha value into hex color
     *  
     *  @param {number} hex 0xRRGGBB
     *  @param {number} alpha 0.0 - 1.0
     *  @returns {number} 0xTTRRGGBB hex color
     */
    hexAlpha(hex:number, alpha:number):number;
}

export const name = 'colors';

/** Build color presets for app environment */
export const bind = async (params:ParamsTemplate):Promise<ColorPreset> => {
    const colors = new ColorPreset();
    Object.freeze(colors.Convert);
    return Object.freeze(colors);
}