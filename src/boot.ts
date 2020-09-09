import FIWLApplication from "./environment/FIWLApplication";
import ParamsTemplate from "./environment/ParamsTemplate";

declare global {
  const app: FIWLApplication;
}

let _params: ParamsTemplate;
const _defaultParams: ParamsTemplate = {
  url: getCurrentURL(),
  root: "/",
  domID: "fiwl-viewport",
  immersive: true,
  callback: {
    onFail: onFatalError,
  },
};

/**
 *  Entry point of FIWL Framework
 *
 *  Called from:
 *  - [index.ts for NPM]{@link ../index.ts}
 *  - [index.m.ts for NPM + TypeScript]{@link ../index.m.ts}
 *  - [fiwl.ts for browser]{@link ../fiwl.ts}
 */
function boot(
  url: string = null,
  params: ParamsTemplate = {}
): FIWLApplication {
  _params = Object.assign(_defaultParams, params);
  if (typeof url == "string") _params.url = url;
  if (_params.immersive === true) adaptDarkMode();
  return new FIWLApplication(_params);
}

function getCurrentURL() {
  let url = location.href;
  url = url.replace(/(\/|(\/|^)index\.(html?|php|asp|cgi)\/?)$/, "");
  history.replaceState({}, document.title, url);
  return location.pathname;
}

function onFatalError(error: Error) {
  console.error(error);
  if (_params.immersive !== true) return;
  const stack = error.stack;
  const errorTitle = stack.substr(0, stack.indexOf("\n")).replace(/\r/g, "");
  const errorBody = stack.substr(stack.indexOf("\n") + 1);
  const body = document.body;
  const br = "<br>";
  document.onselectstart = null;
  body.innerHTML = `<h1><b>${errorTitle}</b></h1>`;
  body.innerHTML += `<pre>${errorBody}</pre>`;
  body.innerHTML += br + br + "[aborted]";
}

function adaptDarkMode(): void {
  if (typeof window.matchMedia == "function") {
    let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDarkMode) {
      document.body.style.color = "#ff7f7f";
      document.body.style.backgroundColor = "#000000";
    } else {
      document.body.style.color = "#c62828";
    }
  }
}

export default boot;
