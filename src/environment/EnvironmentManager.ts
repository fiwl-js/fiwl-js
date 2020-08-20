import ExposableModule from './ExposableModuleType';
import FIWLApplication from './FIWLApplication';
import ParamsTemplate from './ParamsTemplate';

/** Link each parameters to intended app instance, this helps multi-app single page support at future */
const paramsMap:WeakMap<FIWLApplication, ParamsTemplate> = new WeakMap();

/** If true, all bond exposables are changeable. Otherwise, read only */
let isWrittingEnv:boolean = false;

/** Register app's parameters, it makes possible to bind exposables at middle of runtime */
function registerAppParams(appInstance:FIWLApplication, params:ParamsTemplate):void {
    paramsMap.set(appInstance, params);
}

/** Binds array of exposables accordingly identified by their name */
async function bindExposables(target:FIWLApplication, exposableNames:Array<string>):Promise<void> {
    if(!paramsMap.has(target)) {
        throw new ReferenceError('[INTERNAL] App instance is not registered in paramsMap');
    }
    
    const context = require.context('./exposables');
    const keys = context.keys();

    // List all available exposables
    const registered:{[key:string]:string} = {};
    for(let iter = 0; iter < keys.length; iter++) {
        const eachPath = keys[iter];
        const eachName = context(eachPath).name;
        registered[eachName] = eachPath;
    }

    // Bind each requested exposable names
    for(let iter = 0; iter < exposableNames.length; iter++) {
        const eachName = exposableNames[iter];
        const eachPath = registered[eachName];
        if(typeof(eachPath) == 'string') {
            const eachExposable:ExposableModule = context(eachPath);
            const bondExposable = await eachExposable.bind(paramsMap.get(target));
            putMetaConst(target, eachName, bondExposable);
        } else {
            throw new ReferenceError(`[INTERNAL] Exposable with "${eachName}" name is not exist`);
        }
    }
}

/** Declare constant into app environment, but it can be like variable if isWrittingEnv = true */
function putMetaConst(target:FIWLApplication, key:string, value:any):void {
    // @ts-ignore
    if(target[key] == undefined) {
        let currentValue:any = value;
        Object.defineProperty(target, key, {
            get : () => {return currentValue},
            set : (newValue:any) => {
                if(isWrittingEnv) currentValue = newValue;
            }
        });
    } else {
        isWrittingEnv = true;
        // @ts-ignore
        target[key] = value;
        isWrittingEnv = false;
    }
}

export default {
    'registerAppParams' : registerAppParams,
    'bindExposables'    : bindExposables,
    'putMetaConst'      : putMetaConst
}