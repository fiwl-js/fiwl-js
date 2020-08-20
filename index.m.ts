import { syncBind as bindWidgets } from './src/environment/exposables/WidgetClasses';

export { default as boot } from './src/boot';
export { default as WidgetClasses } from './src/environment/exposables/WidgetClasses';
export { default as ColorPreset } from './src/environment/exposables/ColorPreset';
export { EventTypes } from './src/event/EventTypesEnum';
export { default as RenderAPI } from './src/display/renderer/RenderAPI';

export const widgets = bindWidgets();