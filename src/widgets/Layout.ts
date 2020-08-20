import DisplayObject from "./DisplayObject";
import RenderAPI from "../display/renderer/RenderAPI";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";

/** Primitive layout widget */
export default class Layout extends DisplayObject {
  /**
   *  Supported values: "center", "center-y", "center-x", "top", "left", "right", and "bottom".
   *  To combine the values, use pipe ('|') character. Example: "bottom|center-y"
   */
  public alignContents: string = "";

  constructor() {
    super();
    this.width = "content";
    this.height = "content";
    Layout.internal.set(this, {
      container: null,
      contents: [],
    });
  }

  /** Get contents of this layout */
  get contents(): Array<DisplayObject> {
    return Layout.internal.get(this).contents;
  }

  /** Shorthand of .contents.length */
  get length(): number {
    return this.contents.length;
  }

  /** Find content based on its ID */
  findContent(id: string, isRecrusive: boolean = false): DisplayObject {
    // Regular search
    for (let iter = 0; iter < this.length; iter++) {
      const eachContent: DisplayObject = this.contents[iter];
      if (eachContent.id == id) return eachContent;
    }

    // Deep search
    if (isRecrusive) {
      for (let iter = 0; iter < this.length; iter++) {
        const eachContent: DisplayObject = this.contents[iter];
        if (eachContent instanceof Layout) {
          const result = eachContent.findContent(id, isRecrusive);
          if (result != null) return result;
        }
      }
    }

    // If not found
    return null;
  }

  /** Use this to get whole contents width */
  get measuredContentsWidth(): number {
    let result: number = 0;
    for (let iter = 0; iter < this.length; iter++) {
      const eachContent: DisplayObject = this.contents[iter];
      if (eachContent.width == "container") continue;
      if (typeof eachContent.width == "string")
        if (eachContent.width.trimRight().endsWith("%")) continue;
      if (!eachContent.presence) continue;
      let eachSize: number;
      if (
        eachContent.width == "content" ||
        typeof eachContent.width == "number"
      ) {
        eachSize = eachContent.measuredWidth;
      } else {
        eachSize = app.unit.resolve(eachContent.width, 0);
      }
      let eachMeasured: number = app.unit.resolve(eachContent.x, 0);
      eachMeasured += eachSize;
      eachMeasured += app.unit.resolve(eachContent.marginLeft, eachSize / 2);
      eachMeasured += app.unit.resolve(eachContent.marginRight, eachSize / 2);
      result = Math.max(result, eachMeasured);
    }
    return result;
  }

  /** Use this to get whole contents height */
  get measuredContentsHeight(): number {
    let result: number = 0;
    for (let iter = 0; iter < this.length; iter++) {
      const eachContent: DisplayObject = this.contents[iter];
      if (eachContent.height == "container") continue;
      if (typeof eachContent.height == "string")
        if (eachContent.height.trimRight().endsWith("%")) continue;
      if (!eachContent.presence) continue;
      let eachSize: number;
      if (
        eachContent.height == "content" ||
        typeof eachContent.height == "number"
      ) {
        eachSize = eachContent.measuredHeight;
      } else {
        eachSize = app.unit.resolve(eachContent.height, 0);
      }
      let eachMeasured: number = app.unit.resolve(eachContent.y, 0);
      eachMeasured += eachSize;
      eachMeasured += app.unit.resolve(eachContent.marginTop, eachSize / 2);
      eachMeasured += app.unit.resolve(eachContent.marginBottom, eachSize / 2);
      result = Math.max(result, eachMeasured);
    }
    return result;
  }

  /** Measure x position for each content. */
  measureEachContentX(id: string): number {
    const globalX = this.globalX;
    const measuredWidth = this.measuredWidth;
    const paddingLeft = app.unit.resolve(this.paddingLeft, measuredWidth / 2);
    const paddingRight = app.unit.resolve(this.paddingRight, measuredWidth / 2);

    let result: number;

    const target: DisplayObject = this.findContent(id);
    if (target == null) {
      result = globalX + paddingLeft;
    } else {
      if (!target.presence) return 0;

      const targetMeasuredWidth = target.measuredWidth;
      const targetMarginLeft = app.unit.resolve(
        target.marginLeft,
        targetMeasuredWidth / 2
      );
      const targetMarginRight = app.unit.resolve(
        target.marginRight,
        targetMeasuredWidth / 2
      );

      let align: string = this.alignContents;
      if (target.alignSelf.length > 0) align = target.alignSelf;

      const tokenizedAlign: Array<string> = align.split("|");
      let isFound: boolean = false;
      for (let iter = 0; iter < tokenizedAlign.length; iter++) {
        const eachToken: string = tokenizedAlign[iter];
        switch (eachToken.toLowerCase()) {
          case "left":
            result = globalX + paddingLeft + targetMarginLeft;
            break;
          case "center":
          case "center-x":
            let innerWidth = measuredWidth - paddingLeft - paddingRight;
            let midpoint = globalX + paddingLeft + innerWidth / 2;
            let targetMidpoint = targetMeasuredWidth / 2;
            result = midpoint - targetMidpoint;
            break;
          case "right":
            result =
              globalX +
              measuredWidth -
              paddingRight -
              targetMeasuredWidth -
              targetMarginRight;
            break;
          default:
            continue;
        }
        isFound = true;
        break;
      }

      if (!isFound) result = globalX + paddingLeft + targetMarginLeft;

      result = app.unit.resolve(target.x, measuredWidth) + result;
    }

    return result;
  }

  /** Measure y position for each content. */
  measureEachContentY(id: string): number {
    const globalY = this.globalY;
    const measuredHeight = this.measuredHeight;
    const paddingTop = app.unit.resolve(this.paddingTop, measuredHeight / 2);
    const paddingBottom = app.unit.resolve(
      this.paddingBottom,
      measuredHeight / 2
    );

    let result: number;

    const target: DisplayObject = this.findContent(id);
    if (target == null) {
      result = globalY + paddingTop;
    } else {
      if (!target.presence) return 0;

      const targetMeasuredHeight = target.measuredHeight;
      const targetMarginTop = app.unit.resolve(
        target.marginTop,
        targetMeasuredHeight / 2
      );
      const targetMarginBottom = app.unit.resolve(
        target.marginBottom,
        targetMeasuredHeight / 2
      );

      let align: string = this.alignContents;
      if (target.alignSelf.length > 0) align = target.alignSelf;

      const tokenizedAlign: Array<string> = align.split("|");
      let isFound: boolean = false;
      for (let iter = 0; iter < tokenizedAlign.length; iter++) {
        const eachToken: string = tokenizedAlign[iter];
        switch (eachToken.toLowerCase()) {
          case "top":
            result = globalY + paddingTop + targetMarginTop;
            break;
          case "center":
          case "center-y":
            let innerHeight = measuredHeight - paddingTop - paddingBottom;
            let midpoint = globalY + paddingTop + innerHeight / 2;
            let targetMidpoint = targetMeasuredHeight / 2;
            result = midpoint - targetMidpoint;
            break;
          case "bottom":
            result =
              globalY +
              measuredHeight -
              paddingBottom -
              targetMeasuredHeight -
              targetMarginBottom;
            break;
          default:
            continue;
        }
        isFound = true;
        break;
      }

      if (!isFound) result = globalY + paddingTop + targetMarginTop;

      result = app.unit.resolve(target.y, measuredHeight) + result;
    }

    return result;
  }

  /** Helps each contents to resolve "container" and "...%" width value */
  measureEachContentWidth(id: string): number {
    const measuredWidth = this.measuredWidth;
    const paddingLeft = app.unit.resolve(this.paddingLeft, measuredWidth / 2);
    const paddingRight = app.unit.resolve(this.paddingRight, measuredWidth / 2);

    let result: number = 0;
    const target: DisplayObject = this.findContent(id);

    if (target != null) {
      if (!target.presence) return 0;

      let targetMarginLeft = app.unit.resolve(
        target.marginLeft,
        measuredWidth / 2
      );
      let targetMarginRight = app.unit.resolve(
        target.marginRight,
        measuredWidth / 2
      );
      let spacing: number =
        paddingLeft + paddingRight + targetMarginLeft + targetMarginRight;
      if (target.width == "container") {
        result = measuredWidth - spacing;
      } else {
        result = app.unit.resolve(target.width, measuredWidth - spacing);
      }
    }

    return result;
  }

  /** Helps each contents to resolve "container" and "...%" height value */
  measureEachContentHeight(id: string): number {
    const measuredHeight = this.measuredHeight;
    const paddingTop = app.unit.resolve(this.paddingTop, measuredHeight / 2);
    const paddingBottom = app.unit.resolve(
      this.paddingBottom,
      measuredHeight / 2
    );

    let result: number = 0;
    const target: DisplayObject = this.findContent(id);

    if (target != null) {
      if (!target.presence) return 0;

      const targetMarginTop = app.unit.resolve(
        target.marginTop,
        measuredHeight / 2
      );
      const targetMarginBottom = app.unit.resolve(
        target.marginBottom,
        measuredHeight / 2
      );
      const spacing: number =
        paddingTop + paddingBottom + targetMarginTop + targetMarginBottom;
      if (target.height == "container") {
        result = measuredHeight - spacing;
      } else {
        result = app.unit.resolve(target.height, measuredHeight - spacing);
      }
    }

    return result;
  }

  /** Only be called by Render Engine */
  draw(api: RenderAPI): Array<InstructTemplate> {
    const renderList: Array<InstructTemplate> = [];

    const background: Array<InstructTemplate> = this.drawBackground(api);
    renderList.push(api.group(background));

    const contentsRenderList: Array<InstructTemplate> = [];
    for (let iter = 0; iter < this.length; iter++) {
      if (!this.contents[iter].visible) continue;
      const eachContent: Array<InstructTemplate> = this.contents[iter].draw(
        api
      );
      contentsRenderList.push(api.group(eachContent));
    }

    const groupedContents: InstructTemplate = api.group(contentsRenderList);
    const measuredWidth = this.measuredWidth;
    const measuredHeight = this.measuredHeight;

    if (this.clipping) {
      let clipped;
      if (this.cornerRadius == 0) {
        clipped = api.crop(
          groupedContents,
          this.globalX,
          this.globalY,
          measuredWidth,
          measuredHeight
        );
      } else {
        const cornerRadius = app.unit.resolve(
          this.cornerRadius,
          Math.min(measuredWidth, measuredHeight) / 2
        );
        const mask = api.roundRect(
          this.globalX,
          this.globalY,
          measuredWidth,
          measuredHeight,
          app.colors.transparent,
          cornerRadius
        );
        clipped = api.mask(groupedContents, mask);
      }
      renderList.push(clipped);
    } else {
      renderList.push(groupedContents);
    }

    return this.drawPostEffect(api, renderList);
  }
}
