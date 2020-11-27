import ColorPreset from "./exposables/ColorPreset";
import NetworkInterface from "./exposables/NetworkInterface";
import ManifestInterface from "./exposables/ManifestInterface";
import ResourceInterface from "./exposables/ResourceInterface";
import DisplayInterface from "./exposables/DisplayInterface";
import UnitConversionInterface from "./exposables/UnitConversionInterface";
import StorageInterface from "./exposables/StorageInterface";
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
  public storage: StorageInterface;
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
      "storage",
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
    // TODO: Route to another stage
  }

  /**
   * 
   * @param {string} action The action to be performed | values = 'read' or 'write'
   */
  clipboard(action: string, data?: string): Promise<string | void> | Error {
    if (action == 'read') return navigator.clipboard.readText().then(text => text);
    else if (action == 'write') {
      if (data) return navigator.clipboard.writeText(data);
      else return new ReferenceError('Data arguement is null. Data should be a non-null string.')
    }
    else return new TypeError('Please provide a valid action, read or write.');
  }
}
