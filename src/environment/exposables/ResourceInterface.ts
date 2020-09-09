import ParamsTemplate from "../ParamsTemplate";
import ResourceManager from "../../resource/ResourceManager";
import FIWLStyle from "../../resource/FIWLStyle";
import StageManifestTemplate from "../../stage/StageManifestTemplate";
import { Font } from "opentype.js";

export default interface ResourceInterface {
  // WARNING: Modifying interface requires major version increment!
  url: string;
  style: FIWLStyle;

  /**
   *  Get global or stage-specific icon, asynchronously.
   *  The icon must be formatted as SVG.
   *
   *  @param {string} name Name of file, you don't have to write .svg extension
   *  @returns {Promise<ImageBitmapSource>} Use ".then(result => { ... })" to get the result
   */
  loadIcon: (name: string) => Promise<ImageBitmapSource>;

  /**
   *  Get app or stage scope picture, asynchronously.
   *
   *  @param {string} name Name of file, do not write extension suffix like .jpg
   *  @param {string} extension File's format extension, default is "jpg"
   *  @returns {Promise<ImageBitmapSource>} Use ".then(result => {...})" to get the result
   */
  loadPicture: (name: string, extension?: string) => Promise<ImageBitmapSource>;

  /**
   *  Get app or stage scope font, asynchronously.
   *
   *  @param {string} name Name of file, do not write extension suffix like .ttf
   *  @param {string} extension File's format extension, default is "ttf"
   *  @returns {Promise<Font>} Use ".then(result => {...})" to get the result
   */
  loadFont: (name: string, extension?: string) => Promise<Font>;
}

export const name = "res";

/** Builds Resource Interface for app environment */
export const bind = async (
  params: ParamsTemplate
): Promise<ResourceInterface> => {
  // Get current stage configuration from manifest.json if exist
  const stages = app.manifest.stages;
  let currentStage: StageManifestTemplate = {
    route: params.url,
  };
  for (let iter = 0; iter < stages.length; iter++) {
    const eachStage: StageManifestTemplate = stages[iter];
    if (eachStage.route == currentStage.route) {
      currentStage = Object.assign(currentStage, eachStage);
      break;
    }
  }

  // Resolve resource URL
  if (typeof currentStage.resource != "string") {
    currentStage.resource = currentStage.route;
  }
  if (!currentStage.resource.startsWith("/")) {
    currentStage.resource = "/" + currentStage.resource;
  }
  let rootURL = params.root.replace(/\/$/, "");
  currentStage.resource = rootURL + currentStage.resource;

  // Load style asynchronously
  const style: FIWLStyle = await ResourceManager.loadStyle(
    currentStage.resource
  );

  // The real binding process
  return Object.freeze({
    url: currentStage.route,
    style: style,
    loadIcon: (name: string) => {
      return ResourceManager.loadIcon(currentStage.resource, name);
    },
    loadPicture: (name: string, extension: string = "jpg") => {
      return ResourceManager.loadPicture(
        currentStage.resource,
        name,
        extension
      );
    },
    loadFont: (name: string, extension: string = "ttf") => {
      return ResourceManager.loadFont(currentStage.resource, name, extension);
    },
  });
};
