import ColorPreset from "./exposables/ColorPreset";
import NetworkInterface from "./exposables/NetworkInterface";
import ManifestInterface from "./exposables/ManifestInterface";
import ResourceInterface from "./exposables/ResourceInterface";
import DisplayInterface from "./exposables/DisplayInterface";
import UnitConversionInterface from "./exposables/UnitConversionInterface";
import EventInterface from "./exposables/EventInterface";
import WidgetClasses from "./exposables/WidgetClasses";

import FIWLStage from "../stage/FIWLStage";

import ParamsTemplate from "./ParamsTemplate";
import EnvironmentManager from "./EnvironmentManager";
import StageManager from "../stage/StageManager";

export default class FIWLApplication {
  public colors: ColorPreset;
  public net: NetworkInterface;
  public manifest: ManifestInterface;
  public res: ResourceInterface;
  public display: DisplayInterface;
  public unit: UnitConversionInterface;
  public event: EventInterface;
  public widgets: WidgetClasses;

  public stage: FIWLStage;

  constructor(params: ParamsTemplate) {
    EnvironmentManager.registerAppParams(this, params);

    const bindingProcess = EnvironmentManager.bindExposables(this, [
      "colors",
      "net",
      "manifest",
      "res",
      "display",
      "unit",
      "event",
      "widgets",
    ]);

    // Attach environment creation callback:
    if (typeof params.callback == "object") {
      if (typeof params.callback.onFail == "function") {
        bindingProcess.catch((error) => params.callback.onFail(error));
      }
      if (typeof params.callback.onCreated == "function") {
        bindingProcess.then(() => params.callback.onCreated());
      }
    }

    bindingProcess.then(() => {
      return StageManager.goto(params.url);
    });
  }

  async goto(route: string): Promise<void> {
    //
  }
}
