/** Functions that will be called after app environment creation */
export default interface EnvCreationListener {
    onCreated? : () => void;
    onFail?    : (error:Error) => void;
    onReady?   : () => void;
}