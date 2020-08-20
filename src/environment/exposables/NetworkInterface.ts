import ParamsTemplate from "../ParamsTemplate";
import UploadListener from "../../network/UploadListener";
import NetworkManager from "../../network/NetworkManager";

/** Access to networking utility to communicate with server */
export default interface NetworkInterface {
  /**
   *  Get something from server asynchronously
   *
   *  @param {string} url Intended URL
   *  @returns {Promise<string>} Use ".then(result => {...})" to get the result}
   */
  get: (url: string) => Promise<string>;

  /**
   *  Get JSON data from server then decode
   *
   *  @param {string} url Intended URL
   *  @returns {Promise<Object>} Use ".then(result => {...})" to get the result
   */
  getJSON: (url: string) => Promise<Object>;

  /**
   *  Get image from anywhere at internet, asynchronously
   *
   *  @param {string} url Intended image's URL
   *  @returns {Promise<ImageBitmap>} Use ".then(result => {...})" to get the result
   */
  getImage: (url: string) => Promise<ImageBitmap>;

  /**
   *  Send something to server asynchronously
   *
   *  @param {string} url Intended URL
   *  @param {string|Object} thing Something to be sent. If object, it will encoded as JSON
   *  @returns {Promise<string>} Use ".then(result => {...})" to get the result
   */
  post: (url: string, thing: string | Object) => Promise<string>;

  /**
   *  Set or add new to request header
   *
   *  @param {string} key Request header key name
   *  @param {string} value Request header value
   *  @returns {void} Nothing
   */
  setHeader: (key: string, value: string) => void;

  /**
   *  Get request header value corresponds to key name.
   *  If not available, returns undefined
   *
   *  @param {string} key Request header key name
   *  @returns {string} Request header value
   */
  getHeader: (key: string) => string;

  /**
   *  Removes request header item identified by key name
   *
   *  @param {string} key Request header key name
   *  @returns {void} Nothing
   */
  removeHeader: (key: string) => void;

  /**
   *  Download file from anywhere at internet
   *
   *  @param {string} url Targeted file URL
   *  @param {string} filename File name for client side, Don't forget the extension!
   *  @returns {void} Nothing
   */
  download: (url: string, filename: string) => void;

  /**
   *  Upload a single or multiple files to server, asynchronously
   *
   *  @param {string} url Targeted URL
   *  @param {UploadListener} callback Extensible callback, just in case onProgress or onCancel are needed
   *  @param {string|Array} [filetype] Mime Type or File extension
   *  @param {string} [dataKey] Key name to be shown on server side, default is "data"
   *  @returns {Promise<boolean>} Use ".then((isUploaded) => {...})" to run something on finish
   */
  upload: (
    url: string,
    callback: UploadListener,
    filetype?: string,
    dataKey?: string
  ) => Promise<boolean>;

  /** Set request-level credential */
  setCredential: (username: string, password: string) => void;

  /** Remove request-level credential */
  removeCredential: () => void;
}

export const name = "net";

export const bind = async (
  params: ParamsTemplate
): Promise<NetworkInterface> => {
  const net: NetworkInterface = {
    get: (url: string) => {
      return NetworkManager.get(url);
    },
    getJSON: (url: string) => {
      return NetworkManager.getJSON(url);
    },
    getImage: (url: string) => {
      return NetworkManager.getImage(url);
    },
    post: (url: string, thing: string | Object) => {
      return NetworkManager.post(url, thing);
    },
    setHeader: (key: string, value: string) => {
      NetworkManager.header.set(key, value);
    },
    getHeader: (key: string) => {
      return NetworkManager.header.get(key);
    },
    removeHeader: (key: string) => {
      NetworkManager.header.delete(key);
    },
    download: (url: string, filename: string) => {
      return NetworkManager.download(url, filename);
    },
    upload: (
      url: string,
      callback: UploadListener,
      filetype: string = null,
      dataKey: string = "data"
    ) => {
      return NetworkManager.upload(url, dataKey, callback, filetype);
    },
    setCredential: (username: string, password: string) => {
      NetworkManager.setCredential(username, password);
    },
    removeCredential: () => {
      NetworkManager.removeCredential();
    },
  };
  return Object.freeze(net);
};
