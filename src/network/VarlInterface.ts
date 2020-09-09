/** Provides typing support for varl-js */
export default interface VarlInterface {
  /** Convert from object into VARL-formatted string synchronously */
  encodeSync: (input: Object) => string;

  /** Convert from object into VARL-formatted string asynchronously */
  encode: (
    input: Object,
    callback?: (output: string) => void
  ) => Promise<string>;

  /** Convert from VARL-formatted string into object synchronously */
  decodeSync: (input: string) => Object;

  /** Convert from VARL-formatted string into object asynchronously */
  decode: (
    input: string,
    callback?: (output: Object) => void
  ) => Promise<Object>;
}
