/** Provides default app style */
export default class FIWLStyle {
  // NOTE: Remember to modify the docs if this modified
  public primaryColor: number = 0x5c6bc0;
  public primaryLightColor: number = 0x8e99f3;
  public primaryDarkColor: number = 0x26418f;
  public onPrimaryColor: number = 0xffffff;
  public secondaryColor: number = 0x4caf50;
  public secondaryLightColor: number = 0x80e27e;
  public secondaryDarkColor: number = 0x087f23;
  public onSecondaryColor: number = 0xffffff;
  public errorColor: number = 0xb00020;
  public onErrorColor: number = 0xffffff;
  public textColor: number = 0x000000;
  public foregroundColor: number = 0x000000;
  public backgroundColor: number = 0xffffff;
  public stageBackgroundColor: number = 0xdfdfdf;
  public displayTextSize: number | string = "48sp";
  public titleTextSize: number | string = "38sp";
  public headerTextSize: number | string = "32sp";
  public bodyTextSize: number | string = "12sp";
  public controlTextSize: number | string = "24sp";
  public headerFontType: string = "";
  public bodyFontType: string = "";
  public controlFontType: string = "";
  constructor() {}
}
