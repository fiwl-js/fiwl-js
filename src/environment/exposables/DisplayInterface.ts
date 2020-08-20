import ParamsTemplate from '../ParamsTemplate';
import DisplayManager from '../../display/DisplayManager';

export default interface DisplayInterface {
    scale:number;
    width:number;
    height:number;
    isLandscape:boolean;
    setCursor:(name:'default'|'processing'|'clickable'|'text'|'move'|'draggable'|'dragging'|'denied') => void;
}

export const name = 'display';

export const bind = async (params:ParamsTemplate):Promise<DisplayInterface> => {
    await DisplayManager.attachRenderer(params);
    
    const display:DisplayInterface = {scale:1, width:0, height:0, isLandscape:true, setCursor:DisplayManager.setCursor};
    Object.defineProperty(display, 'scale', {
        'get' : DisplayManager.getScale
    });
    Object.defineProperty(display, 'width', {
        'get' : DisplayManager.getWidth
    });
    Object.defineProperty(display, 'height', {
        'get' : DisplayManager.getHeight
    });
    Object.defineProperty(display, 'isLandscape', {
        'get' : () => {
            return (DisplayManager.getWidth() > DisplayManager.getHeight());
        }
    });

    return Object.freeze(display);
}