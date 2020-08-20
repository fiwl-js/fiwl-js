import LayerTemplate from "../LayerTemplate";
import RenderAPI from "../renderer/RenderAPI";
import InstructTemplate from "../renderer/templates/InstructTemplate";

export default class BootAnimLayer implements LayerTemplate {
  public tag: string = "boot";
  public objectContext: Object = this;
  public x: number = 0;
  public y: number = 0;
  public alpha: number = 1;
  public scaleX: number = 1;
  public scaleY: number = 1;

  private splash: ImageBitmap;
  private splashWidth: number;
  private splashHeight: number;

  /** Angular position of rotating circle */
  private radian: number = 0;

  constructor(splash: ImageBitmap = null) {
    this.splash = splash;

    // Splash resize
    if (splash != null) {
      const ratio = splash.width / splash.height;
      this.splashHeight = 128;
      this.splashWidth = this.splashHeight * ratio;
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      let handler = setInterval(() => {
        if (this.alpha > 0) {
          this.alpha = Math.max(this.alpha - 0.1, 0);
          this.scaleX += 0.05;
          this.scaleY += 0.05;
        } else {
          clearInterval(handler);
          resolve();
        }
      }, 1000 / 60);
    });
  }

  drawFunc(api: RenderAPI): Array<InstructTemplate> {
    if (app.display == undefined) return [];

    // Array of render instructions
    const instructs: Array<InstructTemplate> = [];

    // Draw background
    instructs.push(
      api.rect(
        0,
        0,
        app.display.width,
        app.display.height,
        app.res.style.primaryColor
      )
    );

    // Draw splash icon, or app name if splash icon not configured
    if (this.splash != null) {
      const splashWidth = app.unit.convert(this.splashWidth, app.unit.Types.DP);
      const splashHeight = app.unit.convert(
        this.splashHeight,
        app.unit.Types.DP
      );
      instructs.push(
        api.bitmap(
          this.splash,
          app.display.width / 2 - splashWidth / 2,
          app.display.height / 2.8 - splashHeight / 2,
          splashWidth,
          splashHeight
        )
      );
    } else {
      const textSize = app.unit.resolve(app.res.style.displayTextSize);
      instructs.push(
        api.text(
          app.manifest.name,
          16,
          app.display.height / 2.4 - textSize / 2,
          textSize,
          app.res.style.onPrimaryColor,
          ["bold"],
          null,
          "center"
        )
      );
    }

    // Loading animation
    if (this.radian < Math.PI * 4 - 0.2) {
      this.radian += 0.075;
    } else if (
      this.radian > Math.PI * 2 - 0.8 &&
      this.radian < Math.PI * 2 + 0.8
    ) {
      this.radian += 1.6;
    } else {
      this.radian -= Math.PI * 4;
    }
    let degreeStart = this.radian * (180 / Math.PI);
    let degreeEnd = this.radian * (180 / Math.PI) * 2;
    const isCCW = this.radian >= Math.PI * 2;
    instructs.push(
      api.lineArc(
        app.display.width / 2,
        app.display.height / 1.4,
        app.unit.convert(32, app.unit.Types.DP),
        app.res.style.onPrimaryColor,
        degreeStart,
        degreeEnd,
        app.unit.convert(8, app.unit.Types.DP),
        1,
        isCCW
      )
    );

    return instructs;
  }
}
