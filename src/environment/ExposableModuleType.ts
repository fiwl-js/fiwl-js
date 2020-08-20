import ParamsTemplate from './ParamsTemplate';

/** Represents each module inside ./exposables, DO NOT implements! */
export default interface ExposableModuleType {
    default:any;
    name:string;
    bind:(params:ParamsTemplate) => Promise<any>;
}