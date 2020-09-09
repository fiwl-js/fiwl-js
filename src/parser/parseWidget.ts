import DisplayObject from "../widgets/DisplayObject";
import InvalidWidgetException from "../exceptions/InvalidWidgetException";
import Layout from "../widgets/Layout";

const parser = new DOMParser();

/** Parse widget from each tag at .fiwl file */
export default function parseWidget(data: string | Element): DisplayObject {
  let rawObject;
  if (typeof data == "string") {
    rawObject = parser.parseFromString(`<xml>${data}</xml>`, "text/xml")
      .children[0];
  } else if (data instanceof Element) {
    rawObject = data;
  } else throw new SyntaxError("Expected string or Element object!");

  const className = rawObject.tagName;

  // @ts-ignore
  const widgetClass: typeof DisplayObject = app.widgets[className];
  const internalMap: WeakMap<DisplayObject, any> = widgetClass.internal;
  if (typeof widgetClass != "function") {
    throw new InvalidWidgetException(className);
  }

  const widget = new widgetClass();
  internalMap.set(widget, { container: null });
  if (!(widget instanceof DisplayObject)) {
    throw new InvalidWidgetException(className);
  }

  const attrs = rawObject.attributes;
  for (let iter = 0; iter < attrs.length; iter++) {
    const eachAttr = attrs[iter];
    const key = eachAttr.name;
    if (key == "contents") continue;
    const value = parseProperty(eachAttr.value);
    // @ts-ignore
    widget[key] = value;
  }

  if (typeof widgetClass.parseContents == "function") {
    if (rawObject.innerHTML.trim().length > 0) {
      let contentKey = "contents";
      let contentValue = widgetClass.parseContents(rawObject.innerHTML);
      if (typeof widgetClass.customContentsKey == "string") {
        contentKey = widgetClass.customContentsKey;
      }
      if (widgetClass.writableContents === true) {
        // @ts-ignore
        widget[contentKey] = contentValue;
      } else {
        internalMap.get(widget)[contentKey] = contentValue;
        Object.defineProperty(widget, contentKey, {
          get: () => {
            return internalMap.get(widget)[contentKey];
          },
        });
      }
    }
  } else if (widget instanceof Layout) {
    // Add "contents" to widget's internal map
    const modifiedMap = internalMap.get(widget);
    modifiedMap.contents = new Array<DisplayObject>();
    internalMap.set(widget, modifiedMap);

    const rawContent = rawObject.children;
    for (let iter = 0; iter < rawContent.length; iter++) {
      const eachContent = rawContent[iter];
      const parsed = parseWidget(eachContent);
      internalMap.get(parsed).container = widget;
      internalMap.get(widget).contents.push(parsed);
    }
  }

  return widget;
}

/** Parse tag attribute as fixed property type */
function parseProperty(value: any): any {
  if (value === "") return null;
  else if (!isNaN(Number(value))) return Number(value);
  else if (value == "true") return true;
  else if (value == "false") return false;
  else if (typeof value == "string") {
    if (value.startsWith("#")) {
      return Number("0x" + value.substr(1));
    } else if (value.startsWith("@color/")) {
      // @ts-ignore
      return app.colors[value.substr(7)];
    } else if (value.startsWith("@style/")) {
      // @ts-ignore
      return app.res.style[value.substr(7)];
    } else {
      value = value.replace(/\\r/gm, "\r");
      value = value.replace(/\\n/gm, "\n");
      value = value.replace(/\\t/gm, "\t");
      value = value.replace(/\\\"/gm, '"');
      value = value.replace(/\\\'/gm, "'");
      value = value.replace(/\\\\/gm, "\\");
    }
  }
  return value;
}
