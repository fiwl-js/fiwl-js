import Layout from "../widgets/Layout";
import { EventTypes } from "./EventTypesEnum";
import DataTemplate from "./templates/DataTemplate";
import PointingEventData from "./data/PointingEventData";
import DisplayObject from "../widgets/DisplayObject";
import ListenerTemplate from "./templates/ListenerTemplate";
import DispatcherTemplate from "./templates/DispatcherTemplate";

const listenerMap: Map<EventTypes, ListenerTemplate[]> = new Map();
resetListenerMap();

let dispatchers: DispatcherTemplate[] = [];

function attachDOM(viewportInstance: HTMLCanvasElement): void {
  const context = require.context("./dispatchers");
  const keys = context.keys();
  for (let iter = 0; iter < keys.length; iter++) {
    const eachKey = keys[iter];
    if (!eachKey.endsWith(".ts")) continue;
    const eachValue = context(eachKey).default;
    const eachDispatcher: DispatcherTemplate = new eachValue();
    dispatchers.push(eachDispatcher);
    eachDispatcher.attach(viewportInstance, listenerMap);
  }
}

function resetListenerMap(): void {
  for (const eachType in EventTypes) {
    // @ts-ignore
    listenerMap.set(EventTypes[eachType], []);
  }
}

function startDispatchers(): void {
  for (let iter = 0; iter < dispatchers.length; iter++) {
    dispatchers[iter].start();
  }
}

function stopDispatchers(): void {
  for (let iter = 0; iter < dispatchers.length; iter++) {
    dispatchers[iter].stop();
  }
}

function addEventListener(
  type: EventTypes,
  listener: (eventData: DataTemplate) => void,
  context?: DisplayObject
): void {
  const targetListeners: ListenerTemplate[] = listenerMap.get(type);
  if (context instanceof DisplayObject) {
    targetListeners.push({ func: listener, target: context });
  } else {
    targetListeners.push({ func: listener });
  }
}

function removeEventListener(
  type: EventTypes,
  listener: (eventData: DataTemplate) => void
): void {
  const targetListeners: ListenerTemplate[] = listenerMap.get(type);
  for (let iter = 0; iter < targetListeners.length; iter++) {
    const eachListener = targetListeners[iter];
    if (eachListener.func == listener) {
      targetListeners.splice(iter, 1);
      iter--;
    }
  }
}

function isInTarget(target: DisplayObject, x: number, y: number): boolean {
  if (!app.stage) return false;
  if (!target.container) return false;
  if (!target.visible) return false;

  const targetX1 = target.globalX;
  const targetY1 = target.globalY;
  const targetX2 = targetX1 + target.measuredWidth;
  const targetY2 = targetY1 + target.measuredHeight;

  return x >= targetX1 && x <= targetX2 && y >= targetY1 && y <= targetY2;
}

export default {
  attachDOM: attachDOM,
  resetListenerMap: resetListenerMap,
  startDispatchers: startDispatchers,
  stopDispatchers: stopDispatchers,
  isInTarget: isInTarget,
  addEventListener: addEventListener,
  removeEventListener: removeEventListener,
};
