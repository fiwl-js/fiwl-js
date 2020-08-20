import InstructTemplate from "./templates/InstructTemplate";

export default class RenderEngine {
    private outputElement:HTMLCanvasElement = null;
    private context:CanvasRenderingContext2D = null;

    constructor(elementID:string, immersive:boolean) {
        const existedElement = document.getElementById(elementID);
        if(existedElement instanceof HTMLCanvasElement) {
            this.outputElement = existedElement;
        } else {
            this.outputElement = document.createElement('canvas');
            this.outputElement.id = elementID;
            document.body.appendChild(this.outputElement);
        }

        const disableListener = (event:Event):boolean => {
            event.preventDefault();
            return false;
        }

        this.context = this.outputElement.getContext('2d');

        this.outputElement.addEventListener('contextmenu', disableListener);
        this.outputElement.addEventListener('selectstart', disableListener);

        if(immersive) {
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.overflow = 'hidden';
            this.outputElement.style.position = 'absolute';
            this.outputElement.style.top = '0';
            this.outputElement.style.left = '0';
            this.outputElement.style.width = '100%';
            this.outputElement.style.height = '100%';
            const onResize = () => {
                this.outputElement.width = this.width;
                this.outputElement.height = this.height;
            };
            window.addEventListener('resize', onResize);
            onResize();
        }
    }

    /** This is relative pixel density. Desktop is 1.0, mobile phone is around 2.0 */
    public get scale():number {
        return window.devicePixelRatio;
    }

    public get width():number {
        if(this.outputElement != null) {
            return this.outputElement.clientWidth * this.scale;
        } else {
            return 0;
        }
    }

    public get height():number {
        if(this.outputElement != null) {
            return this.outputElement.clientHeight * this.scale;
        } else {
            return 0;
        }
    }

    public reset() {
        this.instructBuffer = [];
        this.instructBuffer.push({
            'render' : context => context.clearRect(0, 0, this.width, this.height)
        });
    }

    public setCursor(name:'default'|'processing'|'clickable'|'text'|'move'|'draggable'|'dragging'|'denied'):void {
        let cssStandard:string = 'default';
        switch(name) {
            case 'processing':
                cssStandard = 'wait';
            break;
            case 'clickable':
                cssStandard = 'pointer';
            break;
            case 'text':
                cssStandard = 'text';
            break;
            case 'move':
                cssStandard = 'move';
            break;
            case 'draggable':
                cssStandard = 'grab';
            break;
            case 'dragging':
                cssStandard = 'grabbing';
            break;
            case 'denied':
                cssStandard = 'not-allowed';
            break;
        }
        this.outputElement.style.cursor = cssStandard;
    }

    /** Queue of instructions that not executed yet */
    private instructBuffer:Array<InstructTemplate> = [];

    /** NaN represents no execution is running, otherwise equals "requestAnimationFrame" value */
    private execHandler:number = NaN;

    /** Add new render instruction */
    public pushInstruction(instruct:InstructTemplate):void {
        this.instructBuffer.push(instruct);
        if(isNaN(this.execHandler)) {
            this.execHandler = requestAnimationFrame(() => {
                this.executeInstruction();
            });
        }
    }

    private executeInstruction():void {
        // Stop execution loop if instructBuffer isn't filled on frame transition
        if(this.instructBuffer.length == 0) {
            this.execHandler = NaN;
            return;
        }

        for(let iter = 0; iter < this.instructBuffer.length; iter++) {
            this.context.save();
            const eachInstruct = this.instructBuffer[iter];
            eachInstruct.render(this.context);
            this.context.restore();
        }

        // Clean the buffer, then check the buffer if filled on frame transition
        this.instructBuffer = [];
        this.execHandler = requestAnimationFrame(() => {
            this.executeInstruction();
        });
    }
}