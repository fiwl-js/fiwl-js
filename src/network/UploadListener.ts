/** Event listener for upload */
export default interface UploadListener {
    onProgress?:(percentage:number, loaded:number, total:number, fileCount:number) => void;
    onCancel?:() => void;
    onSuccess?:() => void;
    onFailed?:(error:Error) => void;
}