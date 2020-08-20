import parseWidget from "./parseWidget";
import FIWLParserException from "../exceptions/FIWLParserException";
import NetworkManager from "../network/NetworkManager";
import Layout from "../widgets/Layout";
import DisplayObject from "../widgets/DisplayObject";
import FIWLStage from "../stage/FIWLStage";

const parser = new DOMParser();

/** Parse .fiwl file as Stage */
export default function parseStage(stringData: string): Object {
  stringData = fixScriptEvent(stringData.trim());

  const parsed = parser.parseFromString(stringData, "text/xml");
  if (parsed.getElementsByTagName("parsererror").length > 0) {
    throw new FIWLParserException(parsed);
  }

  if (parsed.children.length != 1) {
    throw new FIWLParserException("Only one root tag allowed in .fiwl file");
  }

  const rawObject = parsed.children[0];
  if (rawObject.tagName.toLowerCase() != "stage") {
    throw new FIWLParserException('Root tag must "Stage"');
  }

  /** For checking event listener existence inside parsed stage */
  const dummyInteractiveStage: FIWLStage = new FIWLStage();

  const stage: any = {};
  stage.title = null;

  const rawProps = rawObject.attributes;
  for (let iter = 0; iter < rawProps.length; iter++) {
    const eachProps = rawProps.item(iter);
    const key = eachProps.name;
    const value = eachProps.value;
    stage[key] = value;
  }

  const rawStage = rawObject.children;
  let isHasLayout = false;
  for (let iter = 0; iter < rawStage.length; iter++) {
    const eachRaw = rawStage[iter];
    switch (eachRaw.tagName.toLowerCase()) {
      case "event":
        if (!eachRaw.hasAttribute("on")) {
          console.warn(
            'Every <event> ... </event> must have "on" attribute. Otherwise, they\'re useless'
          );
          break;
        }

        const onAttrib = eachRaw.getAttribute("on");
        const eventName =
          "on" + onAttrib[0].toUpperCase() + onAttrib.substr(1).toLowerCase();
        // @ts-ignore
        if (typeof dummyInteractiveStage[eventName] == "function") {
          stage[eventName] = new Function(eachRaw.textContent);
          Object.defineProperty(stage[eventName], "name", {
            value:
              eventName[0].toUpperCase() + eventName.substr(1) + "Listener",
            writable: true,
            configurable: true,
          });
        } else {
          console.warn(`Stage doesn't support ${eventName}(...) event`);
        }
        break;
      case "script":
        let scriptType = "javascript";
        if (eachRaw.hasAttribute("type")) {
          scriptType = eachRaw.getAttribute("type").toLowerCase();
        }

        switch (scriptType) {
          case "javascript":
            if (eachRaw.hasAttribute("from")) {
              NetworkManager.get(eachRaw.getAttribute("from")).then(
                (result) => {
                  const eachScript = new Function(result);
                  Object.defineProperty(eachScript, "name", {
                    value: "StageController",
                    writable: false,
                    configurable: false,
                  });
                  eachScript.call(stage);
                }
              );
            } else {
              const eachScript = new Function(eachRaw.textContent);
              Object.defineProperty(eachScript, "name", {
                value: "StageController",
                writable: false,
                configurable: false,
              });
              eachScript.call(stage);
            }
            break;
          case "wasm":
            /** @todo WASM support here... */
            break;
          default:
            console.error(`"${scriptType}" is not supported`);
        }
        break;
      default:
        if (isHasLayout) {
          // Making sure only one root Layout tag
          throw new FIWLParserException(
            "Only one root layout allowed in a Stage tag"
          );
        } else {
          stage.layout = parseWidget(eachRaw);
          if (!eachRaw.hasAttribute("width")) stage.layout.width = "container";
          if (!eachRaw.hasAttribute("height"))
            stage.layout.height = "container";
          if (!eachRaw.hasAttribute("backgroundColor"))
            stage.layout.backgroundColor = app.res.style.stageBackgroundColor;
          isHasLayout = true;
        }
        break;
    }
  }

  if (stage.layout == undefined) {
    throw new FIWLParserException(
      "Stage must contain exactly one root Layout tag"
    );
  }

  if (
    !(stage.layout instanceof Layout) &&
    stage.layout instanceof DisplayObject
  ) {
    throw new FIWLParserException(
      `Expected Layout or its descendants instead of ${stage.layout.className}`
    );
  }

  return stage;
}

/**
 *  Fix problem where some operators inside scripts and events are misinterpreted.
 *  The solution is wrap each script and event with CDATA.
 */
function fixScriptEvent(input: string): string {
  let output = input.trim();

  // Inject "<![CDATA[" after "<script ... >" and "<event ... >"
  const preMatchRegex = /\<(script|event)[^\/]*?\>/gim;
  const preMatch = output.match(preMatchRegex);
  if (preMatch != null) {
    const preMatchCount = preMatch.length;
    for (let iter = 0; iter < preMatchCount; iter++) {
      const eachTag = preMatchRegex.exec(output);
      const injectIndex = eachTag.index + eachTag[0].length;
      output =
        output.substr(0, injectIndex) +
        "<![CDATA[" +
        output.substr(injectIndex);
    }
  }

  // Inject "]]>" before "</script>" and "</event>"
  const postMatchRegex = /(\<\/script\>)|(\<\/event\>)/gim;
  const postMatch = output.match(postMatchRegex);
  if (postMatch != null) {
    const postMatchCount = postMatch.length;
    for (let iter = 0; iter < postMatchCount; iter++) {
      const eachTag = postMatchRegex.exec(output);
      const injectIndex = eachTag.index;
      output =
        output.substr(0, injectIndex) + "]]>" + output.substr(injectIndex);
    }
  }

  return output;
}
