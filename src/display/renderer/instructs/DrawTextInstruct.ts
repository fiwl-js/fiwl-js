import InstructTemplate from "../templates/InstructTemplate";
import { hexToCSS } from "../RenderToolkit";

// Most browser cannot load custom typeface correctly, we need dependency
import { Font } from "opentype.js";

// @fiwl-name text

export default class DrawTextInstruct implements InstructTemplate {
  public text: string;
  public x: number;
  public y: number;
  public size: number;
  public colorHex: number;
  public styles: string[] = [];
  public font: Font = null;
  public horizontalAlign: "left" | "center" | "right" = "left";

  private static hadBeenWarned: boolean = false;

  constructor(
    text: string,
    x: number,
    y: number,
    size: number,
    colorHex: number,
    styles: string[] = [],
    font: Font = null,
    horizontalAlign: "left" | "center" | "right" = "left"
  ) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.size = size;
    this.colorHex = colorHex;
    this.styles = styles;
    this.font = font;
    this.horizontalAlign = horizontalAlign;
  }

  render(context: CanvasRenderingContext2D) {
    // Removes carriage-return chars for better performance
    this.text = this.text.replace(/\r/gm, "");

    // Built-in text rendering has no stable custom font support,
    // and OpenType.js module does not support default font.
    // The only solution is splitting the function.
    if (this.font == null) {
      this.renderWithDefaultFont(context);
    } else {
      this.renderWithCustomFont(context);
      this.font = undefined; // Prevent memory leak
    }
  }

  renderWithDefaultFont(context: CanvasRenderingContext2D) {
    const cssStyles = this.styles.join(" ");
    context.font = context.font.replace(/^.*px/, cssStyles + ` ${this.size}px`);
    context.textBaseline = "top";

    let offsetX = 0;
    const textWidth = context.measureText(this.text).width;
    switch (this.horizontalAlign) {
      case "left":
        context.textAlign = this.horizontalAlign;
        break;
      case "center":
        context.textAlign = this.horizontalAlign;
        offsetX += textWidth / 2;
        break;
      case "right":
        context.textAlign = this.horizontalAlign;
        offsetX += textWidth;
        break;
    }

    context.fillStyle = hexToCSS(this.colorHex);
    context.fillText(this.text, this.x + offsetX, this.y);
  }

  renderWithCustomFont(context: CanvasRenderingContext2D) {
    const text: string = this.text.split("\n", 1)[0];
    if (this.text != text && !DrawTextInstruct.hadBeenWarned) {
      console.warn(
        "WARNING: Custom font does not support multi-line render!\nplease split lines on your own."
      );
      DrawTextInstruct.hadBeenWarned = true;
    }

    this.font.draw(
      context,
      text,
      this.x,
      this.y + (this.size * 2) / 3,
      this.size
    );
  }
}
