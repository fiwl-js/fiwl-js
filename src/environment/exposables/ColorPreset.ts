import ParamsTemplate from "../ParamsTemplate";

/**
 *  Provides nice and easy color palette.
 *  Courtesy Google Material Design.
 */
export default class ColorPreset {
  public redLight: number = 0xffcdd2;
  public red: number = 0xf44336;
  public redDark: number = 0xb71c1c;
  public pinkLight: number = 0xf8bbd0;
  public pink: number = 0xe91e63;
  public pinkDark: number = 0x880e4f;
  public purpleLight: number = 0xe1bee7;
  public purple: number = 0x9c27b0;
  public purpleDark: number = 0x4a148c;
  public indigoLight: number = 0xc5cae9;
  public indigo: number = 0x3f51b5;
  public indigoDark: number = 0x1a237e;
  public blueLight: number = 0xbbdefb;
  public blue: number = 0x2196f3;
  public blueDark: number = 0x0d47a1;
  public cyanLight: number = 0xb2ebf2;
  public cyan: number = 0x00bcd4;
  public cyanDark: number = 0x006064;
  public tealLight: number = 0xb2dfdb;
  public teal: number = 0x009688;
  public tealDark: number = 0x004d40;
  public greenLight: number = 0xc8e6c9;
  public green: number = 0x4caf50;
  public greenDark: number = 0x1b5e20;
  public limeLight: number = 0xf0f4c3;
  public lime: number = 0xcddc39;
  public limeDark: number = 0x827717;
  public yellowLight: number = 0xfff9c4;
  public yellow: number = 0xffeb3b;
  public yellowDark: number = 0xf57f17;
  public amberLight: number = 0xffecb3;
  public amber: number = 0xffc107;
  public amberDark: number = 0xff6f00;
  public orangeLight: number = 0xfff3e0;
  public orange: number = 0xff9800;
  public orangeDark: number = 0xe65100;
  public brownLight: number = 0xd7ccc8;
  public brown: number = 0x795548;
  public brownDark: number = 0x3e2723;
  public grayLight: number = 0xf5f5f5;
  public gray: number = 0x9e9e9e;
  public grayBlue: number = 0x607d8b;
  public grayDark: number = 0x212121;
  public white: number = 0xffffff;
  public black: number = 0x000000;
  public greyLight: number = 0xf5f5f5;
  public grey: number = 0x9e9e9e;
  public greyBlue: number = 0x607d8b;
  public greyDark: number = 0x212121;
  public transparent: number = 0xff000000;

  /** Convert another coloring system to FIWL-standard */
  public Convert: ColorConversion = {
    rgba: (
      red: number,
      green: number,
      blue: number,
      alpha: number = 1
    ): number => {
      let result = blue;
      result |= green << 8;
      result |= red << 16;
      result |= ((1 - alpha) * 0xff) << 24;
      return result >>> 0;
    },
    hexAlpha: (hex: number, alpha: number): number => {
      let result = (hex >>> 0) & 0xffffff;
      result |= ((1 - alpha) * 0xff) << 24;
      return result;
    },
  };
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
  rgba(red: number, green: number, blue: number, alpha?: number): number;

  /**
   *  Put alpha value into hex color
   *
   *  @param {number} hex 0xRRGGBB
   *  @param {number} alpha 0.0 - 1.0
   *  @returns {number} 0xTTRRGGBB hex color
   */
  hexAlpha(hex: number, alpha: number): number;
}

export const name = "colors";

/** Build color presets for app environment */
export const bind = async (params: ParamsTemplate): Promise<ColorPreset> => {
  const colors = new ColorPreset();
  Object.freeze(colors.Convert);
  return Object.freeze(colors);
};
