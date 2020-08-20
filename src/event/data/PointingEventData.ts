import DataTemplate from "../templates/DataTemplate";

/** Unites all pointing events including mouse, touch, and stylus pen */
export default interface PointingEventData extends DataTemplate {
    x:number;
    y:number;
    velocityX:number;
    velocityY:number;
    dragging:boolean;

    // For touchscreen, scroll values equal velocity values.
    scrollX:number;
    scrollY:number;
    
    // Combo keys, always false on typical smartphone
    withShift:boolean;
    withCTRL:boolean;
    withALT:boolean;

    // NOTE: For macOS, the combo key is swapped as below to prevent conflict with macOS' hot-keys
    //       COMMAND --> CTRL
}