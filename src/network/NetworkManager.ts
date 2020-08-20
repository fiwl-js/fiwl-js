import VarlInterface from "./VarlInterface";
import UploadListener from "./UploadListener";
import NetworkException from "../exceptions/NetworkException";
import { Font, load } from "opentype.js";

// VARL dependency
const varl: VarlInterface = require("varl");

// Stored headers configuration in RAM
const headers: Map<string, string> = new Map();

// Request-level credentials:
var _username: string = null;
var _password: string = null;

/** Acceptable request methods */
enum Method {
  GET,
  POST,
}

/** Core request function */
function request(
  url: string,
  method: Method,
  body: string = ""
): Promise<string> {
  return new Promise((resolve, reject) => {
    const networkAPI = new XMLHttpRequest();
    networkAPI.open(Method[method], url, true, _username, _password);
    networkAPI.onreadystatechange = () => {
      // Any type of error must kill the network-request thread:
      if (
        networkAPI.status >= 400 ||
        networkAPI.status == 4 ||
        networkAPI.status == 5
      ) {
        const error = new NetworkException(
          networkAPI.status,
          networkAPI.statusText,
          url
        );
        reject(error);

        // Workaround for suppressing default error
        throw null;
      }

      // If in-progress, keep waiting:
      if (networkAPI.status < 200 && networkAPI.status != 2) return;

      // Resolve result when success:
      if (networkAPI.readyState == XMLHttpRequest.DONE) {
        resolve(networkAPI.response);
      }
    };

    headers.forEach((value: string, key: string) => {
      networkAPI.setRequestHeader(key, value);
    });

    // Tell the server this request came from fiwl.js, not browser's URL box.
    networkAPI.setRequestHeader("Is-Resource", "true");

    switch (method) {
      case Method.GET:
        networkAPI.send();
        break;
      case Method.POST:
        networkAPI.send(body);
        break;
      default:
        reject(
          new NetworkException(
            400,
            `"${Method[method]}" is not a valid method!`,
            url
          )
        );
    }
  });
}

function get(url: string): Promise<string> {
  return request(url, Method.GET);
}

async function getJSON(url: string): Promise<object> {
  const data = await request(url, Method.GET);
  return JSON.parse(data);
}

async function getVARL(url: string): Promise<object> {
  const data = await request(url, Method.GET);
  return await varl.decode(data);
}

function getFont(url: string): Promise<Font> {
  return new Promise((resolve, reject) => {
    load(url, (error, font) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(font);
    });
  });
}

function getImage(url: string): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      const imgBmp = createImageBitmap(img, 0, 0, img.width, img.height);
      resolve(imgBmp);
    };
    img.onerror = () => reject(new Error("Image is inaccessible"));
    img.src = url;
  });
}

async function post(url: string, thing: string | Object): Promise<string> {
  if (typeof thing == "string") {
    return await request(url, Method.POST, thing);
  } else {
    const encoded: string = JSON.stringify(thing);
    return await request(url, Method.POST, encoded);
  }
}

function download(url: string, filename: string): void {
  const dom = document.createElement("a");
  dom.href = url;
  dom.download = filename;
  dom.click();
}

/**
 *  Use .then(isNotCanceled => {...}) or callback parameter to
 *  check if the upload successful, canceled, or even failed.
 */
function upload(
  url: string,
  dataKey: string,
  callback: UploadListener = {},
  filetype: string | Array<string> = null
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const formDOM = document.createElement("form");
    formDOM.method = "POST";
    formDOM.enctype = "multipart/form-data";
    formDOM.action = url;
    const inputDOM = document.createElement("input");
    inputDOM.name = dataKey;
    inputDOM.type = "file";
    if (filetype == null) {
      inputDOM.accept = null;
    } else if (typeof filetype == "string") {
      inputDOM.accept = filetype;
    } else if (Array.isArray(filetype)) {
      inputDOM.accept = filetype.join(",");
    } else {
      throw new TypeError("filetype must either string or array!");
    }
    inputDOM.onchange = () => {
      if (inputDOM.files.length > 0) {
        const networkAPI = new XMLHttpRequest();
        if (typeof callback.onProgress == "function") {
          networkAPI.upload.onprogress = (event) => {
            const loaded = event.loaded;
            const total = event.total;
            const percentage = (loaded * 100) / total;
            callback.onProgress(
              percentage,
              loaded,
              total,
              inputDOM.files.length
            );
          };
        }
        networkAPI.onloadend = () => {
          if (networkAPI.status == 200) {
            if (typeof callback.onSuccess == "function") callback.onSuccess();
            resolve(true);
          } else {
            const error = new NetworkException(
              networkAPI.status,
              networkAPI.statusText,
              url
            );
            if (typeof callback.onFailed == "function")
              callback.onFailed(error);
            reject(error);
          }
        };
        networkAPI.open("POST", url);
        headers.forEach((value: string, key: string) => {
          networkAPI.setRequestHeader(key, value);
        });
        const formData = new FormData(formDOM);
        networkAPI.send(formData);
      } else {
        if (typeof callback.onCancel == "function") callback.onCancel();
        resolve(false);
      }
    };
    formDOM.appendChild(inputDOM);
    inputDOM.click();
  });
}

/** Set request-level credential */
function setCredential(username: string, password: string): void {
  _username = username;
  _password = password;
}

/** Remove request-level credential */
function removeCredential(): void {
  _username = null;
  _password = null;
}

// Register functions or variables here to expose:
export default {
  get: get,
  getJSON: getJSON,
  getVARL: getVARL,
  getImage: getImage,
  getFont: getFont,
  post: post,
  download: download,
  upload: upload,
  header: headers,
  setCredential: setCredential,
  removeCredential: removeCredential,
  Method: Method,
};
