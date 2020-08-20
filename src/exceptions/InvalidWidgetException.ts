/** Throws error caused by missing widget */
export default class InvalidWidgetException extends ReferenceError {
    public widgetClassName:string;
    constructor(widgetClassName:string) {
        super(`"${widgetClassName}" is not a valid widget!`);
        this.name = "MissingWidgetError";
        this.widgetClassName = widgetClassName;
    }
}