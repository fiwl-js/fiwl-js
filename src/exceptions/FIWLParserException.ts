export default class FIWLParserException extends SyntaxError {
    public route:string;
    public explanation:string;

    static makeExplanation(errorDOM:Document|string):string {
        /** @todo change app.res.url to app.stage.url */
        const route:string = app.res.url;
        let explanation:string;
    
        if(errorDOM instanceof Document) {
            explanation = FIWLParserException.parseErrorDOM(errorDOM);
        } else if(typeof(errorDOM) == 'string') {
            explanation = errorDOM + "\n";
        } else {
            explanation = '';
        }
    
        return `On route "${route}"\n${explanation}`;
    }

    static parseErrorDOM(errorDOM:Document):string {
        const containerDOMs = errorDOM.getElementsByTagName('parsererror');
        if(containerDOMs.length > 0) {
            const explanationDOMs = containerDOMs[0].getElementsByTagName('div');
            if(explanationDOMs.length > 0) {
                return explanationDOMs[0].textContent + "\n";
            }
        }
    
        // If error DOM is not parseable, then fallback to empty string
        return '';
    }

    constructor(errorDOM:Document|string) {
        super(FIWLParserException.makeExplanation(errorDOM));
        this.name = 'FIWLParserError';

        this.route = app.res.url;
        
        if(errorDOM instanceof Document) {
            this.explanation = FIWLParserException.parseErrorDOM(errorDOM);
        } else if(typeof(errorDOM) == 'string') {
            this.explanation = errorDOM + "\n";
        } else {
            this.explanation = '';
        }

        if(typeof(this.stack) == 'string') {
            this.stack = this.stack.replace(/\r/gm, '').split("\n\n")[0];
        }
    }
}