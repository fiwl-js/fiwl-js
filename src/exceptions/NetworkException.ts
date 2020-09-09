/** Throws error caused by network error */
export default class NetworkException extends Error {
  public code: number;
  public reason: string;
  public url: string;

  constructor(code: number, reason: string, url: string) {
    super(`${code} - ${reason}\nURL: ${url}\n`);
    this.name = "NetworkError";
    this.code = code;
    this.reason = reason;
    this.url = url;
  }
}
