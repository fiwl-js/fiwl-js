import EnvCreationListener from "./EnvCreationListener";

/** Parameters that allowed to be passed when creating app environment */
export default interface ParamsTemplate {
  /** Current stage URL */
  url?: string;

  /** ID of HTML DOM which targeted as display output */
  domID?: string;

  /** If true, the HTML DOM will be automatically covers HTML body. Default is true  */
  immersive?: boolean;

  /** URL that contains global assets like manifest.json, style.varl, ... */
  root?: string;

  /** Functions that will be called while app environment creation */
  callback?: EnvCreationListener;
}
