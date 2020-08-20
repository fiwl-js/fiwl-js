import DisplayObject from "./DisplayObject";
import RenderAPI from "../display/renderer/RenderAPI";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";

// Widget should not touch viewport's context directly.
// Therefore, we need dependency to measure the content.
import { Font } from "opentype.js";

/** @private Stores linking between label widget and font type */
const priv_fontType: WeakMap<Label, string> = new WeakMap();

/** @private Stores linking between font type and font object */
const priv_fontObject: Map<string, Font> = new Map();

/** @private Stores temporary each label's line of text to prevent re-measure */
const priv_linesCache: WeakMap<Label, TextLine[]> = new WeakMap();

/** Widget that displays text */
export default class Label extends DisplayObject {
  public static flagForwardWeakMap: Array<WeakMap<DisplayObject, any>> = [
    priv_fontType,
  ];
  public static customContentsKey: string = "text";
  public static parseContents: (data: string) => string = parseTagContents;

  public text: string = "";
  public textSize: number | string = app.res.style.controlTextSize;
  public textColor: number = app.res.style.textColor;
  public bold: boolean = false;
  public italic: boolean = false;
  public underline: boolean = false;
  public wrap: boolean = true;

  constructor() {
    super();
    this.width = "content";
    this.height = "content";
    this.backgroundColor = app.colors.transparent;
  }

  /**
   *  NOTE: Keep this empty to follow alignSelf instead.
   *
   *  Supported values: "center", "center-y", "center-x", "top", "left", "right", and "bottom".
   *  To combine the values, use pipe ('|') character. Example: "bottom|center-y"
   */
  public alignText: string = "";

  /** Download and initialize font asynchronously, if .fontType is specified */
  async asyncCreate(): Promise<void> {
    if (this.fontType.length > 0) {
      await registerFont(this, this.fontType);
    } else {
      priv_fontType.set(this, "");
    }
  }

  /** Font type face. If set, then it automatically downloads the font from server. */
  get fontType(): string {
    if (priv_fontType.has(this)) {
      return priv_fontType.get(this);
    } else {
      return "";
    }
  }
  set fontType(newValue: string) {
    if (typeof newValue != "string") newValue = "";
    newValue = newValue.trim();

    if (newValue.length == 0) {
      priv_fontType.set(this, newValue);
      this.requestUpdate();
      return;
    }

    // If this widget's font type is not linked yet (because not initialized),
    // then let onCreated() download the font object.
    if (priv_fontType.has(this)) {
      registerFont(this, newValue).finally(() => this.requestUpdate());
    } else {
      priv_fontType.set(this, newValue);
    }
  }

  get measuredContentsWidth(): number {
    return measureContentsSize(this, true);
  }

  get measuredContentsHeight(): number {
    return measureContentsSize(this, false);
  }

  /** Only be called by Render Engine */
  draw(api: RenderAPI): Array<InstructTemplate> {
    const renderList: Array<InstructTemplate> = [];

    const background: Array<InstructTemplate> = this.drawBackground(api);
    renderList.push(api.group(background));

    const alignSelf = parseAlign(this.alignSelf);
    let alignText: AlignHolder;
    if (this.alignText) {
      alignText = parseAlign(this.alignText);
    } else if (this.alignSelf) {
      alignText = alignSelf;
    } else {
      alignText = { horizontal: "left", vertical: "top" };
    }

    const fontObject: Font = priv_fontObject.get(this.fontType);
    const emReference: number = app.unit.convert(16, app.unit.Types.SP);
    const textSize: number = app.unit.resolve(this.textSize, emReference);

    let measuredWidth: number = NaN;
    if (this.width != "content") measuredWidth = this.measuredWidth;

    // Reset text lines cache for this widget
    if (priv_linesCache.has(this)) priv_linesCache.delete(this);

    const textLines: TextLine[] = parseTextLines(
      this,
      alignText,
      textSize,
      measuredWidth
    );
    priv_linesCache.set(this, textLines);

    if (this.width == "content") measuredWidth = this.measuredContentsWidth;

    let styles: Array<"bold" | "italic" | "underline"> = [];
    if (this.bold) styles.push("bold");
    if (this.italic) styles.push("italic");
    if (this.underline) styles.push("underline");

    const globalX: number = this.globalX;
    const globalY: number = this.globalY;
    const measuredHeight: number = this.measuredHeight;
    const paddingLeft: number = app.unit.resolve(
      this.paddingLeft,
      measuredWidth / 2
    );
    const paddingRight: number = app.unit.resolve(
      this.paddingRight,
      measuredWidth / 2
    );
    const paddingTop: number = app.unit.resolve(
      this.paddingTop,
      measuredHeight / 2
    );
    const paddingBottom: number = app.unit.resolve(
      this.paddingBottom,
      measuredHeight / 2
    );

    if (this.width == "content") measuredWidth += paddingLeft + paddingRight;

    let textWidth: number = 0;
    for (let iter = 0; iter < textLines.length; iter++) {
      const eachLine = textLines[iter];
      textWidth = Math.max(textWidth, eachLine.width);
    }

    let offsetX: number = 0;
    switch (alignSelf.horizontal) {
      case "left":
        offsetX = paddingLeft;
        break;
      case "center":
        offsetX = measuredWidth / 2 - textWidth / 2;
        break;
      case "right":
        offsetX = measuredWidth - textWidth - paddingRight;
        break;
    }

    let textHeight: number = 0;
    if (textLines.length > 0) {
      textHeight +=
        textLines[textLines.length - 1].y +
        textLines[textLines.length - 1].height;
      textHeight += textLines[0].y * textLines.length;
    }

    let offsetY: number = 0;
    switch (alignSelf.vertical) {
      case "top":
        if (textLines.length > 0) offsetY -= textLines[0].y / 2;
        offsetY += paddingTop;
        break;
      case "center":
        offsetY = measuredHeight / 2 - textHeight / 2;
        offsetY += paddingTop - paddingBottom;
        break;
      case "bottom":
        offsetY = measuredHeight - textHeight;
        offsetY -= paddingBottom;
        break;
    }

    const textInstructs: InstructTemplate[] = [];
    for (let iter = 0; iter < textLines.length; iter++) {
      const eachLine = textLines[iter];
      textInstructs.push(
        api.text(
          eachLine.text,
          globalX + eachLine.x + offsetX,
          globalY + eachLine.y + offsetY,
          textSize,
          this.textColor,
          styles,
          fontObject,
          alignText.horizontal
        )
      );
    }
    const drawnText = api.group(textInstructs);

    priv_linesCache.delete(this);

    if (this.clipping) {
      let clipped;
      if (this.cornerRadius != 0) {
        const mask = api.roundRect(
          globalX,
          globalY,
          measuredWidth,
          measuredHeight,
          app.colors.transparent
        );
        clipped = api.mask(drawnText, mask);
      } else {
        clipped = api.crop(
          drawnText,
          globalX,
          globalY,
          measuredWidth,
          measuredHeight
        );
      }
      renderList.push(clipped);
    } else {
      renderList.push(drawnText);
    }

    return this.drawPostEffect(api, renderList);
  }
}

/**
 *  @static
 *  Tell parser how to parse content of <Label>...</Label>
 */
function parseTagContents(data: string): string {
  data = data.replace(/\\r/gm, "\r");
  data = data.replace(/\\n/gm, "\n");
  data = data.replace(/\\t/gm, "\t");
  data = data.replace(/\\\"/gm, '"');
  data = data.replace(/\\\'/gm, "'");
  data = data.replace(/\\\\/gm, "\\");
  return data.trim();
}

/**
 *  @private
 *  Link font type to a label instance and downloaded font object
 */
async function registerFont(instance: Label, fontType: string): Promise<void> {
  // Prevent re-download if font already downloaded
  if (priv_fontObject.has(fontType)) {
    priv_fontType.set(instance, fontType);
  } else {
    const name = fontType.replace(/\..*$/, "");

    // Check if file extension specified. Otherwise, use default.
    let extension = "ttf";
    if (fontType != name) extension = fontType.substr(name.length + 1);

    try {
      const fontObject = await app.res.loadFont(name, extension);
      if (fontObject.supported) {
        priv_fontType.set(instance, fontType);
        priv_fontObject.set(fontType, fontObject);
      } else {
        priv_fontType.set(instance, "");
        console.error(new Error(`"${fontType}" font type is invalid!`));
      }
    } catch (error) {
      priv_fontType.set(instance, "");
      console.error(new Error(`"${fontType}" font type is inaccessible`));
    }
  }
}

function parseAlign(align: string): AlignHolder {
  let result: AlignHolder = {
    horizontal: "left",
    vertical: "top",
  };

  const tokenizedAlign: string[] = align.split("|");
  for (let iter = 0; iter < tokenizedAlign.length; iter++) {
    const eachToken = tokenizedAlign[iter];

    let foundAlignH: boolean = false;
    if (!foundAlignH) {
      foundAlignH = true;
      switch (eachToken) {
        case "left":
        case "center":
        case "right":
          result.horizontal = eachToken;
          break;
        case "center-x":
          result.horizontal = "center";
          break;
        default:
          foundAlignH = false;
      }
    }

    let foundAlignV: boolean = false;
    if (!foundAlignV) {
      foundAlignV = true;
      switch (eachToken) {
        case "top":
        case "center":
        case "bottom":
          result.vertical = eachToken;
          break;
        case "center-y":
          result.vertical = "center";
          break;
        default:
          foundAlignV = false;
      }
    }

    if (foundAlignH && foundAlignV) break;
  }

  return result;
}

function parseTextLines(
  instance: Label,
  align: AlignHolder,
  sizeInPx: number,
  wrapWidth: number = NaN
): TextLine[] {
  let result: TextLine[] = [];

  // Split lines of text and put each of them into object with parameters
  const textLines: string[] = instance.text.replace(/\r/gm, "").split("\n");
  const rulerCtx = instance.fontType
    ? null
    : prepareRulerCtx(instance, sizeInPx);
  for (let iter = 0; iter < textLines.length; iter++) {
    const eachResult: TextLine = {
      text: textLines[iter],
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    measureLineSize(eachResult, rulerCtx, instance, sizeInPx);
    result.push(eachResult);
  }

  let maxWidth: number = 0;
  if (!isNaN(wrapWidth)) {
    maxWidth = wrapWidth;
    wrapText(result, wrapWidth, rulerCtx, instance, sizeInPx);
    measureLinesPos(result, align, maxWidth);
  } else {
    if (result.length > 0) {
      for (let iter = 0; iter < result.length; iter++) {
        const eachResult = result[iter];
        maxWidth = Math.max(maxWidth, eachResult.width);
      }
      measureLinesPos(result, align, maxWidth);
    }
  }

  if (rulerCtx) rulerCtx.canvas.remove();
  return result;
}

function prepareRulerCtx(
  instance: Label,
  sizeInPx: number
): CanvasRenderingContext2D {
  const ruler = document.createElement("canvas");
  const ctx = ruler.getContext("2d");
  let styles: string[] = [];
  if (instance.bold) styles.push("bold");
  if (instance.italic) styles.push("italic");
  if (instance.underline) styles.push("underline");
  ctx.font = ctx.font.replace(/^.*px/, styles.join(" ") + ` ${sizeInPx}px`);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  return ctx;
}

function measureLineSize(
  textLine: TextLine,
  rulerCtx: CanvasRenderingContext2D,
  instance: Label,
  sizeInPx: number
) {
  if (instance.fontType) {
    // If custom font:
    const font: Font = priv_fontObject.get(instance.fontType);
    const path = font.getPath(textLine.text, 0, 0, sizeInPx);
    const bounding = path.getBoundingBox();
    textLine.width = bounding.x2 - bounding.x1;
    textLine.height = bounding.y2 - bounding.y1;
    if (textLine.y == 0) textLine.y = bounding.y2;
  } else {
    // If default font:
    textLine.width = rulerCtx.measureText(textLine.text).width;
    textLine.height = sizeInPx;
  }
}

function measureLinesPos(
  textLines: TextLine[],
  align: AlignHolder,
  maxWidth: number
) {
  for (let iter = 0; iter < textLines.length; iter++) {
    const eachLine = textLines[iter];
    if (iter > 0) {
      const prevLine = textLines[iter - 1];
      eachLine.y = prevLine.y + prevLine.height;
    }
    switch (align.horizontal) {
      case "center":
        eachLine.x = maxWidth / 2 - eachLine.width / 2;
        break;
      case "right":
        eachLine.x = maxWidth - eachLine.width;
        break;
    }
  }
}

function wrapText(
  textLines: TextLine[],
  wrapWidth: number,
  rulerCtx: CanvasRenderingContext2D,
  instance: Label,
  sizeInPx: number
) {
  for (let iter = 0; iter < textLines.length; iter++) {
    const eachLine = textLines[iter];
    eachLine.text = eachLine.text.trim();

    const whitespaces: string[] = eachLine.text.match(/\s/g) || [];
    let wordCount: number =
      eachLine.text.length > 0 ? whitespaces.length + 1 : 0;

    if (wordCount <= 1 || eachLine.width <= wrapWidth) continue;
    const nextLine: TextLine = {
      text: "",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    textLines.push(nextLine);

    while (wordCount > 1 && eachLine.width > wrapWidth) {
      const separator: string = whitespaces[wordCount - 2];
      const nextSeparator: string =
        wordCount < whitespaces.length + 1 ? whitespaces[wordCount - 1] : "";
      const movingWord: string = eachLine.text.substr(
        eachLine.text.lastIndexOf(separator) + 1
      );
      eachLine.text = eachLine.text.substr(
        0,
        eachLine.text.lastIndexOf(separator)
      );
      nextLine.text = movingWord + nextSeparator + nextLine.text;
      wordCount--;
      measureLineSize(eachLine, rulerCtx, instance, sizeInPx);
    }

    // Update next line's width measurement
    measureLineSize(nextLine, rulerCtx, instance, sizeInPx);
  }
}

function measureContentsSize(instance: Label, isWidth: boolean): number {
  let textLines: TextLine[];
  if (priv_linesCache.has(instance)) {
    textLines = priv_linesCache.get(instance);
  } else {
    let align: AlignHolder;
    if (instance.alignText) {
      align = parseAlign(instance.alignText);
    } else if (instance.alignSelf) {
      align = parseAlign(instance.alignSelf);
    } else {
      align = { horizontal: "left", vertical: "top" };
    }
    const emReference: number = app.unit.convert(16, app.unit.Types.SP);
    const textSize: number = app.unit.resolve(instance.textSize, emReference);
    textLines = parseTextLines(instance, align, textSize);
    priv_linesCache.set(instance, textLines);
  }

  let result: number = 0;
  for (let iter = 0; iter < textLines.length; iter++) {
    const eachLine = textLines[iter];
    if (isWidth) {
      result = Math.max(result, eachLine.width);
    } else {
      result += eachLine.height;
    }
  }
  return result;
}

interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AlignHolder {
  horizontal: "left" | "center" | "right";
  vertical: "top" | "center" | "bottom";
}
