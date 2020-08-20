import Layout from "../widgets/Layout";

/**
 *  Simple object that represents Stage.
 *  Stored in back stack for better performance and RAM usage
 */
export default interface PassiveStage {
    url:string;
    layout:Layout;
    onCreated?:() => Promise<void>;
    onReady?:() => void;
    onFocus?:() => void;
    onUpdate?:() => void;
    onDraw?:() => void;
    onInteract?:() => void;
    onUnfocus?:() => void;
    onSuspend?:() => void;
    onDestroy?:() => void;
}