import Layout from "./Layout";
import RenderAPI from "../display/renderer/RenderAPI";
import InstructTemplate from "../display/renderer/templates/InstructTemplate";
import PointingEventData from "../event/data/PointingEventData";
import { EventTypes } from "../event/EventTypesEnum";
import DataTemplate from "../event/templates/DataTemplate";

export default class DisplayObject {
  /** Identifies widget, set this to make it searchable. Default value is random 8-digit string */
  public id: string = randomID();

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public x: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public y: number | string = 0;

  /** Supported values: number, "container", "content", "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public width: number | string = "100dp";

  /** Supported values: number, "container", "content", "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public height: number | string = "100dp";

  /** Fraction of number, default is 1.0 */
  public scaleX: number = 1;

  /** Fraction of number, default is 1.0 */
  public scaleY: number = 1;

  /** Fraction of number, default is 1.0 */
  public alpha: number = 1;

  /** Number in degree, default is 0 */
  public angle: number = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public elevation: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public cornerRadius: number | string = 0;

  /** If true, this will affects other widgets' location and size at same container */
  public presence: boolean = true;

  /** If true, this will be drawn */
  public visible: boolean = true;

  /** If true, content of this widget will be cropped if exceed the boundary */
  public clipping: boolean = true;

  /** Set true to temporarily prevent update trigger */
  public suspendUpdate: boolean = false;

  /** Use app.colors.* to set the color */
  public backgroundColor: number = app.res.style.backgroundColor;

  /** Use app.colors.* to set the color */
  public foregroundColor: number = app.res.style.foregroundColor;

  /** Use app.colors.* to set the color */
  public borderColor: number = this.foregroundColor;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public borderSize: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public paddingTop: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public paddingBottom: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public paddingLeft: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public paddingRight: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public marginTop: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public marginBottom: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public marginLeft: number | string = 0;

  /** Supported values: number, "...px", "...dp", "...pt", "...sp", "...%", "...vw", and "...vh" */
  public marginRight: number | string = 0;

  /**
   *  Supported values: "center", "center-y", "center-x", "top", "left", "right", and "bottom".
   *  To combine the values, use pipe ('|') character. Example: "bottom|center-y"
   */
  public alignSelf: string = "";

  // Only works if this DisplayObject's container is HookLayout
  public hookTopToTopOf: string = null;
  public hookTopToBottomOf: string = null;
  public hookBottomToBottomOf: string = null;
  public hookBottomToTopOf: string = null;
  public hookLeftToLeftOf: string = null;
  public hookLeftToRightOf: string = null;
  public hookRightToRightOf: string = null;
  public hookRightToLeftOf: string = null;

  public onDraw: () => void = null;
  public onUpdate: () => void = null;
  public onSelect: (eventData: PointingEventData) => void = null;
  public onOption: (eventData: PointingEventData) => void = null;
  public onScroll: (eventData: PointingEventData) => void = null;
  public onDragStart: (eventData: PointingEventData) => void = null;
  public onDragMove: (eventData: PointingEventData) => void = null;
  public onDragEnd: (eventData: PointingEventData) => void = null;
  public onHoverStart: (eventData: PointingEventData) => void = null;
  public onHoverMove: (eventData: PointingEventData) => void = null;
  public onHoverEnd: (eventData: PointingEventData) => void = null;
  public onAsyncCreate: () => Promise<void> = null;
  public onReady: () => void = null;
  public onSuspend: () => void = null;
  public onDestroy: () => void = null;

  /**
   *  Only for widget developer!
   *  Used for async construction as example loading icon from server
   **/
  public async asyncCreate(): Promise<void> {}

  /**
   *  Only for widget developer!
   *  Used for do things when stage is ready, such as adding event listener.
   **/
  public ready(): void {}

  /**
   *  Only for widget developer!
   *  Used for do things when stage is being closed, as example removing event listener.
   **/
  public suspend(): void {}

  // Content configuration for DisplayObject's descendants:
  public static parseContents?: (data: string) => any = null;
  public static customContentsKey?: string = null;
  public static writableContents: boolean = false;

  // Properties behavior flags for DisplayObject's descendants:
  public static flagNoUpdate: Array<string> = [];
  public static flagNoAnimate: Array<string> = [];
  public static flagForwardWeakMap: Array<WeakMap<DisplayObject, any>> = [];

  /** Stores non-exposable properties, NOT FOR App Developers! */
  static internal: WeakMap<DisplayObject, any> = new WeakMap();

  constructor() {
    DisplayObject.internal.set(this, {
      container: null,
      update: null,
    });
  }

  /** Get this object's container, null if not added to layout yet */
  get container(): Layout {
    // @ts-ignore
    return DisplayObject.internal.get(this).container;
  }

  /** Get absolute horizontal position */
  get globalX(): number {
    if (this.container != null) {
      return this.container.measureEachContentX(this.id);
    } else {
      return app.unit.resolve(this.x);
    }
  }

  /** Get absolute vertical position */
  get globalY(): number {
    if (this.container != null) {
      return this.container.measureEachContentY(this.id);
    } else {
      return app.unit.resolve(this.y);
    }
  }

  /** Get absolute width */
  get measuredWidth(): number {
    // @ts-ignore
    if (this.id == app.stage.layout.id) {
      return app.display.width;
    }

    let result: number;

    switch (this.width) {
      case "content":
        const measuredContentsWidth = this.measuredContentsWidth;
        result = measuredContentsWidth;
        result += app.unit.resolve(this.paddingLeft, measuredContentsWidth / 2);
        result += app.unit.resolve(
          this.paddingRight,
          measuredContentsWidth / 2
        );
        break;
      case "container":
        if (this.container != null) {
          result = this.container.measureEachContentWidth(this.id);
        } else {
          result = 0;
        }
        break;
      default:
        if (this.container != null) {
          result = this.container.measureEachContentWidth(this.id);
        } else {
          result = app.unit.resolve(this.width);
        }
        break;
    }

    return result;
  }

  /** Get absolute height */
  get measuredHeight(): number {
    if (this.id == app.stage.layout.id) {
      return app.display.height;
    }

    let result: number;

    switch (this.height) {
      case "content":
        const measuredContentsHeight = this.measuredContentsHeight;
        result = measuredContentsHeight;
        result += app.unit.resolve(this.paddingTop, measuredContentsHeight / 2);
        result += app.unit.resolve(
          this.paddingBottom,
          measuredContentsHeight / 2
        );
        break;
      case "container":
        if (this.container != null) {
          result = this.container.measureEachContentHeight(this.id);
        } else {
          result = 0;
        }
        break;
      default:
        if (this.container != null) {
          result = this.container.measureEachContentHeight(this.id);
        } else {
          result = app.unit.resolve(this.height);
        }
        break;
    }

    return result;
  }

  /** Get minimal width (equals .width = "content"), primitive DisplayObject will returns 0 */
  get measuredContentsWidth(): number {
    return 0;
  }

  /** Get minimal height (equals .height = "content"), primitive DisplayObject will returns 0 */
  get measuredContentsHeight(): number {
    return 0;
  }

  /** Set both .paddingLeft and .paddingRight */
  set paddingHorizontal(newValue: number | string) {
    this.paddingLeft = newValue;
    this.paddingRight = newValue;
  }
  /** If .paddingLeft not equals .paddingRight, then returns NaN */
  get paddingHorizontal(): number | string {
    if (this.paddingLeft == this.paddingRight) {
      return this.paddingLeft;
    } else {
      return NaN;
    }
  }

  /** Set both .paddingTop and .paddingBottom */
  set paddingVertical(newValue: number | string) {
    this.paddingTop = newValue;
    this.paddingBottom = newValue;
  }
  /** If .paddingTop not equals .paddingBottom, then returns NaN */
  get paddingVertical(): number | string {
    if (this.paddingTop == this.paddingBottom) {
      return this.paddingTop;
    } else {
      return NaN;
    }
  }

  /** Set all paddings */
  set paddings(newValue: number | string) {
    this.paddingVertical = newValue;
    this.paddingHorizontal = newValue;
  }
  /** If all paddings not equal, then returns NaN */
  get paddings(): number | string {
    if (
      !isNaN(
        typeof this.paddingVertical == "string"
          ? parseFloat(this.paddingVertical)
          : this.paddingVertical
      ) &&
      !isNaN(
        typeof this.paddingHorizontal == "string"
          ? parseFloat(this.paddingHorizontal)
          : this.paddingHorizontal
      ) &&
      this.paddingVertical == this.paddingHorizontal
    ) {
      return this.paddingTop;
    } else {
      return NaN;
    }
  }

  /** Set both .marginLeft and .marginRight */
  set marginHorizontal(newValue: number | string) {
    this.marginLeft = newValue;
    this.marginRight = newValue;
  }
  /** If .marginLeft not equals .marginRight, then returns NaN */
  get marginHorizontal(): number | string {
    if (this.marginLeft == this.marginRight) {
      return this.marginLeft;
    } else {
      return NaN;
    }
  }

  /** Set both .marginTop and .marginBottom */
  set marginVertical(newValue: number | string) {
    this.marginTop = newValue;
    this.marginBottom = newValue;
  }
  /** If .marginTop not equals .marginBottom, then returns NaN */
  get marginVertical(): number | string {
    if (this.marginTop == this.marginBottom) {
      return this.marginTop;
    } else {
      return NaN;
    }
  }

  /** Set all margins */
  set margins(newValue: number | string) {
    this.marginVertical = newValue;
    this.marginHorizontal = newValue;
  }
  /** If all margins are not equal, then returns NaN */
  get margins(): number | string {
    if (
      !isNaN(
        typeof this.marginVertical == "string"
          ? parseFloat(this.marginVertical)
          : this.marginVertical
      ) &&
      !isNaN(
        typeof this.marginHorizontal == "string"
          ? parseFloat(this.marginHorizontal)
          : this.marginHorizontal
      ) &&
      this.marginVertical == this.marginHorizontal
    ) {
      return this.marginTop;
    } else {
      return NaN;
    }
  }

  /** Set both .scaleX and .scaleY */
  set scale(newValue: number) {
    this.scaleX = newValue;
    this.scaleY = newValue;
  }
  /** Set both .scaleX and .scaleY */
  get scale(): number {
    if (this.scaleX == this.scaleY) {
      return this.scaleX;
    } else {
      return NaN;
    }
  }

  /** Request this widget to be re-rendered */
  requestUpdate(): void {
    const updateFunc = DisplayObject.internal.get(this).update;
    if (typeof updateFunc == "function") updateFunc();
  }

  /** This aids any widgets to reuse DisplayObject's render function for drawing background */
  drawBackground(api: RenderAPI): Array<InstructTemplate> {
    let renderList: Array<InstructTemplate> = [];

    const x = this.globalX;
    const y = this.globalY;
    const width = this.measuredWidth;
    const height = this.measuredHeight;
    const cornerRadius = app.unit.resolve(
      this.cornerRadius,
      Math.min(width, height) / 2
    );

    let fill;
    if (cornerRadius == 0) {
      fill = api.rect(x, y, width, height, this.backgroundColor);
    } else {
      fill = api.roundRect(
        x,
        y,
        width,
        height,
        this.backgroundColor,
        cornerRadius
      );
    }
    renderList.push(fill);

    if (this.borderSize != 0) {
      let outline;
      if (cornerRadius == 0) {
        outline = api.lineRect(
          x,
          y,
          width,
          height,
          this.borderColor,
          app.unit.resolve(this.borderSize, 32 * app.display.scale)
        );
      } else {
        outline = api.lineRoundRect(
          x,
          y,
          width,
          height,
          this.borderColor,
          cornerRadius,
          app.unit.resolve(this.borderSize, 32 * app.display.scale)
        );
      }
      renderList.push(outline);
    }

    if (this.elevation != 0) {
      const grouped = api.group(renderList);
      const elevated = api.elevate(
        grouped,
        app.unit.resolve(this.elevation, 24),
        this.angle
      );
      renderList = [elevated];
    }

    return renderList;
  }

  /** This aids any widgets to reuse DisplayObject's render function for drawing post-draw effects */
  drawPostEffect(
    api: RenderAPI,
    instructs: Array<InstructTemplate>
  ): Array<InstructTemplate> {
    if (this.angle != 0) {
      const grouped = api.group(instructs);
      const rotated = api.rotate(
        grouped,
        this.angle,
        this.globalX,
        this.globalY,
        this.measuredWidth,
        this.measuredHeight
      );
      instructs = [rotated];
    }

    if (this.alpha < 1) {
      const grouped = api.group(instructs);
      const transparent = api.transparency(grouped, this.alpha);
      instructs = [transparent];
    }

    if (this.scaleX != 0 || this.scaleY != 0) {
      const grouped = api.group(instructs);
      const scaled = api.scale(
        grouped,
        this.scaleX,
        this.scaleY,
        this.globalX,
        this.globalY,
        this.measuredWidth,
        this.measuredHeight
      );
      instructs = [scaled];
    }

    return instructs;
  }

  /** Only be called by Render Engine */
  draw(api: RenderAPI): Array<InstructTemplate> {
    return this.drawPostEffect(api, this.drawBackground(api));
  }

  /** Register a function as event listener, with this display object as context */
  addEventListener(
    type: EventTypes,
    listener: (eventData: DataTemplate) => void
  ) {
    app.event.addEventListener(type, listener, this);
  }

  /** Unregister event listener */
  removeEventListener(
    type: EventTypes,
    listener: (eventData: DataTemplate) => void
  ) {
    app.event.removeEventListener(type, listener);
  }
}

function randomID(): string {
  const chars: string =
    "_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength: number = chars.length;
  let result = "";
  for (let iter = 0; iter < 8; iter++) {
    let charPos: number = Math.floor(Math.random() * charsLength);
    if (iter == 0)
      while (!isNaN(Number(chars.charAt(charPos)))) {
        charPos = Math.floor(Math.random() * charsLength);
      }
    result += chars.charAt(charPos);
  }
  return result;
}
