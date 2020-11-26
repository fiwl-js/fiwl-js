import PassiveStage from "./PassiveStage";
import Layout from "../widgets/Layout";

/** Stage that has ability to do something on update (Reactive) */
export default class FIWLStage implements PassiveStage {
  public url: string;
  public layout: Layout;
  public onCreated = async (): Promise<void> => {};
  public onReady = (): void => {};
  public onFocus = (): void => {};
  public onUpdate = (): void => {};
  public onDraw = (): void => {};
  public onUnfocus = (): void => {};
  public onSuspend = (): void => {};
  public onDestroy = (): void => {};
  public title?: string;
  public description?: string;
}
