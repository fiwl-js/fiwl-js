import DisplayObject from "../widgets/DisplayObject";
import Layout from "../widgets/Layout";

/** Convert passive widget to interactive */
export default function interactWidget(
    passiveWidget:DisplayObject,
    listener:(instance:DisplayObject, key:string) => void
):DisplayObject {
    // @ts-ignore
    const result:DisplayObject = new passiveWidget.constructor();
    result.suspendUpdate = true;

    // Put instance ID
    Object.defineProperty(result, 'id', {
        value : passiveWidget.id,
        writable : false,
        configurable : false
    });

    // Clone internal map from passive widget
    // @ts-ignore
    const internal = {...passiveWidget.constructor.internal.get(passiveWidget)};
    internal.container = null;

    // Make contents interactive if current widget is kind of Layout
    if(passiveWidget instanceof Layout) {
        const interactedContent = [];
        for(let iter1 = 0; iter1 < internal.contents.length; iter1++) {
            const eachItem = internal.contents[iter1];
            const interactiveItem = interactWidget(eachItem, listener);
            interactedContent.push(interactiveItem);
            // @ts-ignore
            interactiveItem.constructor.internal.get(interactiveItem).container = result;
        }
        internal.contents = interactedContent;
    }

    // Bind update listener to widget's internal
    internal.update = (key:string = ''):void => listener(result, key);

    // Create interactive widget's internal properties map
    // @ts-ignore
    result.constructor.internal.set(result, internal);

    // Make every widget's property interactive
    const keys = Object.keys(passiveWidget);
    for(let iter = 0; iter < keys.length; iter++) {
        const eachKey = keys[iter];
        if(eachKey == 'fontType') console.log('ok');
        if(eachKey == 'id') continue;
        // @ts-ignore
        if(typeof(passiveWidget[eachKey]) == 'function' || passiveWidget.constructor.flagNoUpdate.includes(eachKey)) {
            // If current key references function:
            // @ts-ignore
            result[eachKey] = passiveWidget[eachKey];
        } else {
            // Otherwise:
            Object.defineProperty(result, eachKey, {
                // @ts-ignore
                get : () => {return passiveWidget[eachKey]},
                set : newValue => {
                    // @ts-ignore
                    passiveWidget[eachKey] = newValue;
                    internal.update(eachKey);
                }
            });
        }
    }

    // @ts-ignore
    const flagForwardWeakMap:Array<WeakMap<DisplayObject, any>> = passiveWidget.constructor.flagForwardWeakMap;
    for(let iter = 0; iter < flagForwardWeakMap.length; iter++) {
        const eachWeakMap:WeakMap<DisplayObject, any> = flagForwardWeakMap[iter];
        eachWeakMap.set(result, eachWeakMap.get(passiveWidget));
    }

    result.suspendUpdate = false;
    return result;
}