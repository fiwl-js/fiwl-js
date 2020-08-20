import ParamsTemplate from "../ParamsTemplate";
import StageManifestTemplate from "../../stage/StageManifestTemplate";

/** Access to Web App's manifest that informs site-scope information */
export default interface ManifestInterface {
  name: string;
  icon: string;
  splash: string;
  description: string;
  metadata: { [key: string]: string };
  stages: Array<StageManifestTemplate>;
  widgets: { [key: string]: string };
}

const defaultValue: ManifestInterface = {
  // NOTE: Modify the docs if this modified.
  name: "Blank App",
  icon: "",
  splash: "",
  description: "This is a FIWL-based app",
  metadata: {},
  stages: [],
  widgets: {},
};

export const name = "manifest";

export const bind = async (
  params: ParamsTemplate
): Promise<ManifestInterface> => {
  let manifestPath: string = params.root.length > 0 ? params.root : "/";
  if (!manifestPath.endsWith("/")) manifestPath += "/";
  manifestPath += "manifest.json";

  let manifestFile: Object;
  try {
    manifestFile = await app.net.getJSON(manifestPath);
  } catch (error) {
    throw new Error('"manifest.json" is invalid');
  }

  const result: ManifestInterface = Object.assign(defaultValue, manifestFile);

  // Redirect all URLs in manifest to root URL
  if (params.root.length > 1) {
    let rootURL = params.root.trim().replace(/\/$/, "");
    if (!rootURL.startsWith("/")) rootURL = "/" + rootURL;
    if (result.icon.length > 0)
      result.icon = rootURL + result.icon.trim().replace(/^\//, "");
    if (result.splash.length > 0)
      result.splash = rootURL + result.splash.trim().replace(/^\//, "");
  }

  // Set name
  document.title = result.name;

  // Load icon
  if (result.icon.endsWith(".svg")) {
    let icon = document.querySelector("link[rel*='icon']");
    if (icon == null) {
      icon = document.createElement("link");
      icon.setAttribute("rel", "icon");
      document.head.appendChild(icon);
    }
    icon.setAttribute("href", result.icon);
  }

  return Object.freeze(result);
};
