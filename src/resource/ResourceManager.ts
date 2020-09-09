import NetworkManager from "../network/NetworkManager";
import FIWLStyle from "./FIWLStyle";
import { Font } from "opentype.js";

/**
 *  Get app or stage scope style.varl, asynchronously
 *
 *  @todo Find way to get rid of error when stage-specific style.varl not available!
 */
function loadStyle(resURL: string): Promise<FIWLStyle> {
  resURL = resURL.trim().replace(/\/$/, "");

  let globalResult: object, stageResult: object;
  const promiseList: Array<Promise<void>> = [];

  // Get app-scope (a.k.a global scope) style.varl
  promiseList.push(
    NetworkManager.getVARL("/style.varl")
      .then((globalResponse) => {
        globalResult = globalResponse;
      })
      .catch(() => {
        console.clear();
        console.warn("/style.varl is not accessible!");
      })
  );

  // Get stage-scope style.varl
  if (resURL != "" && resURL != "/") {
    promiseList.push(
      NetworkManager.getVARL(resURL + "/style.varl")
        .then((stageResponse) => {
          stageResult = stageResponse;
        })
        .catch(() => {
          console.clear();
        })
    );
  }

  return Promise.all(promiseList).then(() => {
    let result: FIWLStyle = new FIWLStyle();
    Object.assign(result, globalResult);
    Object.assign(result, stageResult);
    return result;
  });
}

/** Get app or stage scope icon */
async function loadIcon(
  resURL: string,
  name: string
): Promise<ImageBitmapSource> {
  resURL = resURL.trim().replace(/\/$/, "");
  if (resURL != "" && resURL != "/") {
    try {
      return await NetworkManager.getImage(resURL + "/icons/" + name + ".svg");
    } catch (error) {
      return await NetworkManager.getImage("/icons/" + name + ".svg");
    }
  } else {
    return await NetworkManager.getImage("/icons/" + name + ".svg");
  }
}

/** Get app or stage scope picture */
async function loadPicture(
  resURL: string,
  name: string,
  extension: string = "jpg"
): Promise<ImageBitmapSource> {
  resURL = resURL.trim().replace(/\/$/, "");
  if (name.match(/\..*$/)) warnExtension("loadPicture", name);
  if (resURL != "" && resURL != "/") {
    try {
      return await NetworkManager.getImage(
        resURL + "/pictures/" + name + "." + extension
      );
    } catch (error) {
      return await NetworkManager.getImage(
        "/pictures/" + name + "." + extension
      );
    }
  } else {
    return await NetworkManager.getImage("/pictures/" + name + "." + extension);
  }
}

/** Get app or stage scope font */
async function loadFont(
  resURL: string,
  name: string,
  extension: string = "ttf"
): Promise<Font> {
  resURL = resURL.trim().replace(/\/$/, "");
  if (name.match(/\..*$/)) warnExtension("loadFont", name);
  if (resURL != "" && resURL != "/") {
    try {
      return await NetworkManager.getFont(
        resURL + "/fonts/" + name + "." + extension
      );
    } catch (error) {
      return await NetworkManager.getFont("/fonts/" + name + "." + extension);
    }
  } else {
    return await NetworkManager.getFont("/fonts/" + name + "." + extension);
  }
}

/** Reminds for separating extension suffix to different parameter */
function warnExtension(funcName: string, nameAndExt: string): void {
  const name: string = nameAndExt.replace(/\..*$/, "");
  const extension: string = nameAndExt.substr(name.length + 1);
  console.warn(
    `WARNING: Change app.res.${funcName}("${name}.${extension}") to app.res.${funcName}("${name}", "${extension}")`
  );
}

export default {
  loadStyle: loadStyle,
  loadIcon: loadIcon,
  loadPicture: loadPicture,
  loadFont: loadFont,
};
