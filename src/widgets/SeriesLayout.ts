import Layout from "./Layout";
import DisplayObject from "./DisplayObject";

/*  [Relative Content Size Concept]
 *
 *  Let's say if we use horizontal orientation and have 4 contents with each width:
 *  a: "64dp" <-- Absolute
 *  b: "73%" <-- Relative
 *  c: "container" <-- Absolute
 *  d: "33%" (it's intended, not typo) <-- Relative
 *
 *  NOTE: Assume a.id = 'a', b.id = 'b', and so on.
 *
 *  To resolve those real width, we need to...
 *  1. Measure layout's width
 *     (use .measuredWidth)
 *  2. Measure layout's minimum width, based on absolute contents width
 *     (use .measuredContentsWidth)
 *  3. Calculate free width space
 *     freeSpace = .measuredWidth - .measuredContentsWidth
 *  4. Now let's focus on relative contents,
 *     Remember parts of fraction naming? (Numerator / Denominator)
 *     If not, please google "parts of fraction".
 *  5. Calculate denominator of all relative contents width:
 *     denominator = b.width + d.width
 *  6. The numerator part is depend on which relative content that you are currently resolve.
 *     measureEachContentWidth('b') = freeSpace * (b.width / denominator)
 *     measureEachContentWidth('d') = freeSpace * (d.width / denominator)
 *  7. For any content with "container" width (in this case 'c' content),
 *     use function: resolveRealContainerWidth(c)
 *
 *  In this case the orientation is horizontal. Therefore, each content height and globalY
 *  will use Layout's methods instead. However, if orientation is vertical, then flip
 *  those all width and height things.
 **/

/** Layout that stores widgets in order, from top to bottom or left to right. */
export default class SeriesLayout extends Layout {
  /** Supported values: "horizontal" and "vertical" */
  public orientation: "horizontal" | "vertical" = "vertical";

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public spacing: number | string = 0;

  /** Use this to get whole contents width */
  get measuredContentsWidth(): number {
    const spacing = app.unit.resolve(this.spacing, 0);

    let result: number = 0;
    if (this.orientation == "vertical") {
      const paddingLeft = app.unit.resolve(this.paddingLeft, 0);
      const paddingRight = app.unit.resolve(this.paddingRight, 0);
      result = paddingLeft + paddingRight;
    }

    for (let iter = 0; iter < this.length; iter++) {
      const eachContent: DisplayObject = this.contents[iter];
      if (!eachContent.presence) continue;

      let contentWidth: number = 0;
      if (eachContent.width == "container") {
        if (this.orientation == "horizontal")
          contentWidth = resolveRealContainerWidth(this);
      } else if (eachContent.width == "content") {
        contentWidth = eachContent.measuredWidth;
      } else if (typeof eachContent.width == "string") {
        if (eachContent.width.trimRight().endsWith("%")) {
          contentWidth = 0;
        } else {
          contentWidth = app.unit.resolve(eachContent.width, 0);
        }
      } else {
        contentWidth = eachContent.width;
      }

      const contentOffset = app.unit.resolve(eachContent.x, 0);
      const contentMarginLeft = app.unit.resolve(
        eachContent.marginLeft,
        contentWidth / 2
      );
      const contentMarginRight = app.unit.resolve(
        eachContent.marginRight,
        contentWidth / 2
      );
      switch (this.orientation) {
        case "horizontal":
          result += contentOffset;
          result += contentWidth;
          result += contentMarginLeft + contentMarginRight;
          if (iter < this.length - 1) {
            const nextContent = this.contents[this.length - 1];
            if (iter < this.length - 2 || nextContent.presence) {
              result += spacing;
            }
          }
          break;
        case "vertical":
          let contentOuterWidth = contentOffset;
          contentOuterWidth += contentWidth;
          contentOuterWidth += contentMarginLeft + contentMarginRight;
          result = Math.max(result, contentOuterWidth);
          break;
        default:
          return 0;
      }
    }

    return result;
  }

  /** Use this to get whole contents height */
  get measuredContentsHeight(): number {
    const spacing = app.unit.resolve(this.spacing, 0);

    let result: number = 0;
    if (this.orientation == "horizontal") {
      const paddingTop = app.unit.resolve(this.paddingTop, 0);
      const paddingBottom = app.unit.resolve(this.paddingBottom, 0);
      result = paddingTop + paddingBottom;
    }

    for (let iter = 0; iter < this.length; iter++) {
      const eachContent: DisplayObject = this.contents[iter];
      if (!eachContent.presence) continue;

      let contentHeight: number = 0;
      if (eachContent.height == "container") {
        if (this.orientation == "vertical")
          contentHeight = resolveRealContainerHeight(this);
      } else if (eachContent.height == "content") {
        contentHeight = eachContent.measuredHeight;
      } else if (typeof eachContent.height == "string") {
        if (eachContent.height.trimRight().endsWith("%")) {
          contentHeight = 0;
        } else {
          contentHeight = app.unit.resolve(eachContent.height, 0);
        }
      } else {
        contentHeight = eachContent.height;
      }

      const contentOffset = app.unit.resolve(eachContent.y, 0);
      const contentMarginTop = app.unit.resolve(
        eachContent.marginTop,
        contentHeight / 2
      );
      const contentMarginBottom = app.unit.resolve(
        eachContent.marginBottom,
        contentHeight / 2
      );
      switch (this.orientation) {
        case "horizontal":
          let contentOuterHeight = contentOffset;
          contentOuterHeight = contentHeight;
          contentOuterHeight = contentMarginTop + contentMarginBottom;
          result = Math.max(result, contentOuterHeight);
          break;
        case "vertical":
          result += contentOffset;
          result += contentHeight;
          result += contentMarginTop + contentMarginBottom;
          if (iter < this.length - 1) {
            const nextContent = this.contents[this.length - 1];
            if (iter < this.length - 2 || nextContent.presence) {
              result += spacing;
            }
          }
          break;
        default:
          return 0;
      }
    }

    return result;
  }

  measureEachContentWidth(id: string): number {
    switch (this.orientation) {
      case "horizontal":
        const target = this.findContent(id);
        if (target == null) return 0;
        if (!target.presence) return 0;

        if (target.width == "container") {
          return resolveRealContainerWidth(this);
        } else if (target.width == "content") {
          return target.measuredWidth;
        } else if (typeof target.width == "string") {
          const targetWidth = target.width.trim();
          if (targetWidth.endsWith("%")) {
            const measuredWidth = this.measuredWidth;
            const paddingLeft = app.unit.resolve(
              this.paddingLeft,
              measuredWidth / 2
            );
            const paddingRight = app.unit.resolve(
              this.paddingRight,
              measuredWidth / 2
            );
            const freeSpace = Math.max(
              0,
              measuredWidth -
                this.measuredContentsWidth -
                paddingLeft -
                paddingRight
            );
            const denominator = calculateDenominator(this, "x");
            const nominator = parseFloat(
              targetWidth.substr(0, targetWidth.length - 1)
            );
            return Math.max(0, (freeSpace * nominator) / denominator);
          }
        }

        return app.unit.resolve(target.width, 0);
      case "vertical":
        return super.measureEachContentWidth(id);
      default:
        return 0;
    }
  }

  measureEachContentHeight(id: string): number {
    switch (this.orientation) {
      case "vertical":
        const target = this.findContent(id);
        if (target == null) return 0;
        if (!target.presence) return 0;

        if (target.height == "container") {
          return resolveRealContainerHeight(this);
        } else if (target.height == "content") {
          return target.measuredHeight;
        } else if (typeof target.height == "string") {
          const targetHeight = target.height.trim();
          if (targetHeight.endsWith("%")) {
            const measuredHeight = this.measuredHeight;
            const paddingTop = app.unit.resolve(
              this.paddingTop,
              measuredHeight / 2
            );
            const paddingBottom = app.unit.resolve(
              this.paddingBottom,
              measuredHeight / 2
            );
            const freeSpace = Math.max(
              0,
              measuredHeight -
                this.measuredContentsHeight -
                paddingTop -
                paddingBottom
            );
            const denominator = calculateDenominator(this, "y");
            const nominator = parseFloat(
              targetHeight.substr(0, targetHeight.length - 1)
            );
            return Math.max(0, (freeSpace * nominator) / denominator);
          }
        }

        return app.unit.resolve(target.height, 0);
      case "horizontal":
        return super.measureEachContentHeight(id);
      default:
        return 0;
    }
  }

  measureEachContentX(id: string): number {
    const measuredWidth = this.measuredWidth;
    const paddingLeft = app.unit.resolve(this.paddingLeft, measuredWidth / 2);
    const paddingRight = app.unit.resolve(this.paddingRight, measuredWidth / 2);

    let result: number = 0;
    result += this.globalX;

    if (calculateDenominator(this, "x") == 0) {
      let align: string = this.alignContents;
      const tokenizedAlign: Array<string> = align.split("|");
      for (let iter = 0; iter < tokenizedAlign.length; iter++) {
        const eachToken: string = tokenizedAlign[iter];
        switch (eachToken.toLowerCase()) {
          case "left":
            result += paddingLeft;
            break;
          case "center":
          case "center-x":
            result += paddingLeft - paddingRight;
            result += (measuredWidth - this.measuredContentsWidth) / 2;
            break;
          case "right":
            result -= paddingRight;
            result += measuredWidth - this.measuredContentsWidth;
            break;
          default:
            continue;
        }
        break;
      }
    } else {
      result += paddingLeft;
    }

    const target = this.findContent(id);
    if (target == null) return result;
    if (!target.presence) return 0;

    switch (this.orientation) {
      case "horizontal":
        const paddingRight = app.unit.resolve(
          this.paddingRight,
          measuredWidth / 2
        );
        const spacing = app.unit.resolve(
          this.spacing,
          Math.min(paddingLeft, paddingRight)
        );

        for (let iter = 0; iter < this.length; iter++) {
          const eachContent = this.contents[iter];
          const contentWidth = Math.abs(eachContent.measuredWidth);
          result += app.unit.resolve(eachContent.x, contentWidth);
          result += app.unit.resolve(eachContent.marginLeft, contentWidth / 2);
          if (eachContent == target) break;
          if (!eachContent.presence) continue;
          result += contentWidth;
          result += app.unit.resolve(eachContent.marginRight, contentWidth / 2);
          if (iter < this.length - 1) {
            const nextContent = this.contents[this.length - 1];
            if (iter < this.length - 2 || nextContent.presence) {
              result += spacing;
            }
          }
        }

        return result;
      case "vertical":
        return super.measureEachContentX(id);
      default:
        return result;
    }
  }

  measureEachContentY(id: string): number {
    const measuredHeight = this.measuredHeight;
    const paddingTop = app.unit.resolve(this.paddingTop, measuredHeight / 2);
    const paddingBottom = app.unit.resolve(
      this.paddingBottom,
      measuredHeight / 2
    );

    let result: number = 0;
    result += this.globalY;

    if (calculateDenominator(this, "y") == 0) {
      let align: string = this.alignContents;
      const tokenizedAlign: Array<string> = align.split("|");
      for (let iter = 0; iter < tokenizedAlign.length; iter++) {
        const eachToken: string = tokenizedAlign[iter];
        switch (eachToken.toLowerCase()) {
          case "top":
            result += paddingTop;
            break;
          case "center":
          case "center-y":
            result += paddingTop - paddingBottom;
            result += (measuredHeight - this.measuredContentsHeight) / 2;
            break;
          case "bottom":
            result -= paddingBottom;
            result += measuredHeight - this.measuredContentsHeight;
            break;
          default:
            continue;
        }
        break;
      }
    } else {
      result += paddingTop;
    }

    const target = this.findContent(id);
    if (target == null) return result;
    if (!target.presence) return 0;

    switch (this.orientation) {
      case "vertical":
        const paddingBottom = app.unit.resolve(
          this.paddingBottom,
          measuredHeight / 2
        );
        const spacing = app.unit.resolve(
          this.spacing,
          Math.min(paddingTop, paddingBottom)
        );

        for (let iter = 0; iter < this.length; iter++) {
          const eachContent = this.contents[iter];
          const contentHeight = Math.abs(eachContent.measuredHeight);
          result += app.unit.resolve(eachContent.y, contentHeight);
          result += app.unit.resolve(eachContent.marginTop, contentHeight / 2);
          if (eachContent == target) break;
          if (!eachContent.presence) continue;
          result += contentHeight;
          result += app.unit.resolve(
            eachContent.marginBottom,
            contentHeight / 2
          );
          if (iter < this.length - 1) {
            const nextContent = this.contents[this.length - 1];
            if (iter < this.length - 2 || nextContent.presence) {
              result += spacing;
            }
          }
        }

        return result;
      case "horizontal":
        return super.measureEachContentY(id);
      default:
        return result;
    }
  }
}

/**
 *  @private
 *  Sum all relative layout width or height, the result will be used as denominator for calculating each content's width or height.
 */
function calculateDenominator(instance: SeriesLayout, axis: "x" | "y"): number {
  let result: number = 0;

  for (let iter = 0; iter < instance.length; iter++) {
    const eachContent = instance.contents[iter];
    if (!eachContent.presence) continue;

    // Size can be either width or height, depends on axis parameter.
    let size: number | string;
    switch (axis) {
      case "x":
        size = eachContent.width;
        break;
      case "y":
        size = eachContent.height;
        break;
    }

    if (typeof size == "string") {
      size = size.trim();
      if (size.endsWith("%")) {
        size = size.substr(0, size.length - 1);
        result += parseFloat(size);
      }
    }
  }

  return result;
}

/**
 *  @private
 *  Resolves width if one of content equals "container" by looking for absolute container width recursively
 */
function resolveRealContainerWidth(instance: SeriesLayout): number {
  let currentTarget: DisplayObject = instance;

  while (currentTarget.container != null) {
    let isRelative: boolean = false;

    if (currentTarget.width == "container") isRelative = true;
    if (currentTarget.width == "content") isRelative = true;

    if (typeof currentTarget.width == "string") {
      if (currentTarget.width.trimRight().endsWith("%")) isRelative = true;
    }

    if (isRelative) {
      currentTarget = currentTarget.container;
    } else {
      return app.unit.resolve(currentTarget.width, 0);
    }
  }

  // In case of app developer set root layout with relative width
  return app.display.width;
}

/**
 *  @private
 *  Resolves height if one of content equals "container" by looking for absolute container height recursively
 */
function resolveRealContainerHeight(instance: SeriesLayout): number {
  let currentTarget: DisplayObject = instance;

  while (currentTarget.container != null) {
    let isRelative: boolean = false;

    if (currentTarget.height == "container") isRelative = true;
    if (currentTarget.height == "content") isRelative = true;

    if (typeof currentTarget.height == "string") {
      if (currentTarget.height.trimRight().endsWith("%")) {
        isRelative = true;
      }
    }

    if (isRelative) {
      currentTarget = currentTarget.container;
    } else {
      return app.unit.resolve(currentTarget.height, 0);
    }
  }

  // In case of app developer set root layout with relative height
  return app.display.height;
}
