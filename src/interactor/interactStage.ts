import PassiveStage from "../stage/PassiveStage";
import FIWLStage from "../stage/FIWLStage";
import DisplayObject from "../widgets/DisplayObject";
import interactWidget from './interactWidget';

/** Build interactive stage from passive stage object */
export default function interactStage(
    passiveStage:PassiveStage,
    stageInstance:FIWLStage,
    listener:(instance:DisplayObject, key:string) => void
):void {
    const keys = Object.keys(passiveStage);
    for(let iter = 0; iter < keys.length; iter++) {
        const eachKey = keys[iter];
        switch(eachKey) {
            case 'url':
                Object.defineProperty(stageInstance, eachKey, {
                    value : passiveStage[eachKey],
                    writable : false,
                    configurable : false
                });
            break;
            case 'layout':
                Object.defineProperty(stageInstance, eachKey, {
                    value : interactWidget(passiveStage[eachKey], listener),
                    writable : false,
                    configurable : true
                });
            break;
            case 'title':
                // @ts-ignore
                let currentTitle:string = passiveStage[eachKey];
                Object.defineProperty(stageInstance, eachKey, {
                    get: ():string => {return currentTitle;},
                    set: (newValue:string):void => {
                        currentTitle = newValue;
                        document.title = newValue;
                    }
                });
            break;
            default:
                // @ts-ignore
                stageInstance[eachKey] = passiveStage[eachKey];
            break;
        }
    }
}