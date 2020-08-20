const fs = require('fs');
const path = require('path');

/**
 *  Build RenderAPI.ts based from /src/display/renderer/instructs/*
 *  
 *  @param {boolean} isVerbose
 */
function RenderInstructsBinder(isVerbose = false) {
    console.log('AUTOMATION: RenderInstructsBinder');

    deleteOldFile();
    
    if(!isVerbose) console.log(' - Reading "./src/display/renderer/instructs/*.ts"');
    const instructStringList = getAllInstructs(isVerbose);

    /** @type {Array<InstructPointer>} */
    const instructPointers = [];
    if(!isVerbose) console.log(' - Parsing scripts');
    for(let iter = 0; iter < instructStringList.length; iter++) {
        const eachInstructString = instructStringList[iter];
        const eachInstructPointer = buildInstructPointer(eachInstructString);
        if(isVerbose) {
            console.log(` - Loaded: ${eachInstructPointer.className} as ${eachInstructPointer.key}`);
        }
        instructPointers.push(eachInstructPointer);
    }

    console.log(' - Compiling RenderAPI.ts');
    const output = makeRenderApi(instructPointers);

    console.log(' - Writting RenderAPI.ts');
    writeRenderApi(output);

    console.log(" - Done!\n");
}

function deleteOldFile() {
    const filePath = path.resolve(__dirname, '../src/display/renderer/RenderAPI.ts');
    if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 *  @param {boolean} isVerbose
 *  @returns {Array<string>}
 */
function getAllInstructs(isVerbose) {
    const directoryPath = path.resolve(__dirname, '../src/display/renderer/instructs');
    if(isVerbose) console.log(` - Mapping Directory "${directoryPath}"`);

    const files = fs.readdirSync(directoryPath);

    /** @type {Array<string>} */
    let result = []
    for(let iter = 0; iter < files.length; iter++) {
        const eachFileName = files[iter];
        const eachFilePath = path.join(directoryPath, eachFileName);
        if(isVerbose) console.log(` - Reading "${eachFilePath}"`);
        const eachData = fs.readFileSync(eachFilePath, {encoding : 'utf-8'});
        result.push(eachData);
    }
    
    return result;
}

/**
 *  @typedef {object} ParamPointer Stores each parameter's key and type
 *  @property {string} key
 *  @property {string} type
 *  @property {string} [value]
**/

/**
 *  @typedef {object} InstructPointer Stores each instruction name and parameters
 *  @property {string} key
 *  @property {string} className
 *  @property {Array<ParamPointer>} params
**/

/** 
 *  @param {string} instructString
 *  @returns {InstructPointer}
 */
function buildInstructPointer(instructString) {
    const className = getClassName(instructString);
    const key = getKey(instructString, className);
    const paramPointers = buildParamPointers(instructString, className);
    return {
        'key'       : key,
        'className' : className,
        'params'    : paramPointers
    }
}

/**
 *  @param {string} instructString 
 *  @returns {string}
 */
function getClassName(instructString) {
    let prefix = 'export default class ';
    let suffixChars = [' '];
    let startPos = instructString.indexOf(prefix);
    if(startPos < 0) {
        prefix = 'export default ';
        startPos = instructString.indexOf(prefix);
        suffixChars = suffixChars.concat([';', "\r", "\n"]);
    }
    if(startPos < 0) {
        throw new SyntaxError('No default class found');
    }
    startPos += prefix.length;

    let result = '';
    for(let iter = startPos; iter < instructString.length; iter++) {
        const eachChar = instructString[iter];
        if(suffixChars.includes(eachChar)) break;
        result += eachChar
    }

    return result;
}

/**
 *  @param {string} instructString 
 *  @param {string} className 
 *  @returns {string}
 */
function getKey(instructString, className) {
    let startPos = instructString.indexOf('//');
    if(startPos >= 0) {
        const keyPrefix = '@fiwl-name ';
        startPos += 2;
        startPos = instructString.indexOf(keyPrefix, startPos);
        if(startPos >= 0) {
            startPos += keyPrefix.length;
            let result = '';
            for(let iter = startPos; iter < instructString.length; iter++) {
                const eachChar = instructString[iter];
                if(result.length == 0 && !isNaN(eachChar)) {
                    throw new SyntaxError('Key of '+className+' is started with number');
                }
                if(!eachChar.match(/[0-9a-zA-Z\_]/)) break;
                result += eachChar;
            }
            return result;
        }
    }

    // If @fiwl-name lint isn't written:
    let fallback = className.replace(/Instruct$/, '');
    fallback = fallback[0].toLowerCase() + fallback.substr(1);
    return fallback;
}

/**
 *  @param {string} instructString 
 *  @param {string} className 
 *  @returns {Array<ParamPointer>}
 */
function buildParamPointers(instructString, className) {
    let prefix = 'class ' + className;
    let startPos = instructString.indexOf(prefix);
    if(startPos < 0) {
        throw new SyntaxError(className + ' class is not found');
    }
    startPos += prefix.length;

    prefix = 'constructor';
    startPos = instructString.indexOf(prefix, startPos);
    if(startPos < 0) {
        throw new SyntaxError(className + ' class has no constructor');
    }
    startPos += prefix.length;

    prefix = '(';
    startPos = instructString.indexOf(prefix, startPos);
    if(startPos < 0) {
        throw new SyntaxError(className + ' class seems invalid, please check.');
    }
    startPos += prefix.length;

    /** @type {Array<string>} */
    let closureStack = [];
    let constructorArgsString = '';
    const singleLevelClosures = ["\'", "\"", "\`"];
    for(let iter = startPos; iter < instructString.length; iter++) {
        const eachChar = instructString[iter];
        const lastStack = closureStack[closureStack.length-1];
        const isSingleClosure = !singleLevelClosures.includes(lastStack);
        switch(eachChar) {
            case "\'":
            case "\"":
            case "\`":
                if(lastStack == eachChar) {
                    closureStack.pop();
                } else if(isSingleClosure) {
                    closureStack.push(eachChar);
                }
            break;
            case "\\":
                iter++;
            case "\r":
            case "\n":
                continue;
        }
        if(isSingleClosure) {
            switch(eachChar) {
                case '<':
                    closureStack.push('>');
                break;
                case '>':
                    if(lastStack == '>') {
                        closureStack.pop();
                    }
                break;
                case '[':
                    closureStack.push(']');
                break;
                case ']':
                    if(lastStack == ']') {
                        closureStack.pop();
                    }
                break;
            }
        }
        if(closureStack.length > 0) {
            if(eachChar == ',') {
                constructorArgsString += '%&COMMA$';
            } else {
                constructorArgsString += eachChar;
            }
        } else {
            if(eachChar == ')') break;
            constructorArgsString += eachChar;
        }
    }

    let constructorArgsArray = constructorArgsString.split(',');

    /** @type {Array<ParamPointer>} */
    let paramPointers = [];
    for(let iter = 0; iter < constructorArgsArray.length; iter++) {
        const eachArg = constructorArgsArray[iter].trim().replace(/\%\&COMMA\$/g, ',');
        const tokenized = eachArg.split('=');
        const identifierTokenized = tokenized[0].trim().split(':');
        const key = identifierTokenized[0].trim();
        if(key.length == 0) continue;
        const type = (identifierTokenized.length > 1) ? identifierTokenized[1].trim() : 'any';
        const isHasValue = (tokenized.length > 1);

        /** @type {ParamPointer} */
        let newPointer;
        if(isHasValue) {
            const value = tokenized[1].trim();
            newPointer = {
                'key'   : key,
                'type'  : type,
                'value' : value
            };
        } else {
            newPointer = {
                'key'   : key,
                'type'  : type
            };
        }

        paramPointers.push(newPointer);
    }

    return paramPointers;
}

/**
 *  @param {Array<InstructPointer>} instructPointers 
 *  @returns {string}
 */
function makeRenderApi(instructPointers) {
    const imports = makeImports(instructPointers);
    const methods = makeMethods(instructPointers);
    return `${imports}
// WARNING: This file is auto-generated, DO NOT TOUCH!

// Generated by: /automation/RenderInstructsBinder.js

/** Provides widget developers some functions that instruct RenderEngine to draw something */
export default class RenderAPI {

    // Why singleton? Because RenderAPI need to be sent to all widgets'
    // .draw() parameter, normal instance creation will crowds the memory
    private static _instance:RenderAPI = null;
    private constructor() {}
    public static get api() {
        if(RenderAPI._instance == null) RenderAPI._instance = new RenderAPI();
        return RenderAPI._instance;
    }
    ${methods}
}`;
}

/**
 *  @param {Array<InstructPointer>} instructPointers 
 *  @returns {string}
 */
function makeImports(instructPointers) {
    let result = '';

    result += "import {Font} from 'opentype.js';\r\n";
    result += makeTemplatesImport();

    for(let iter = 0; iter < instructPointers.length; iter++) {
        const eachInstruct = instructPointers[iter];
        result += `import ${eachInstruct.className} from './instructs/${eachInstruct.className}';\r\n`;
    }

    return result;
}

/** @returns {string} */
function makeTemplatesImport() {
    let result = '';
    const dirPath = path.resolve(__dirname, '../src/display/renderer/templates');
    const files = fs.readdirSync(dirPath);
    for(let iter = 0; iter < files.length; iter++) {
        const eachFile = files[iter].replace(/\.ts$/i, '');
        result += `import ${eachFile} from './templates/${eachFile}';\r\n`;
    }
    return result;
}

/**
 *  @param {Array<InstructPointer>} instructPointers 
 *  @returns {string}
 */
function makeMethods(instructPointers) {
    let result = '';

    for(let iter = 0; iter < instructPointers.length; iter++) {
        const eachInstruct = instructPointers[iter];
        const args = serializeParams(eachInstruct.params, true);
        const assignParams = serializeParams(eachInstruct.params, false);
        result += `
    ${eachInstruct.key}(${args}):${eachInstruct.className} {
        return new ${eachInstruct.className}(${assignParams});
    }
    `;
    }

    return result;
}

/**
 *  @param {Array<ParamPointer>} paramPointers 
 *  @param {boolean} isFunctionParam 
 *  @returns {string}
 */
function serializeParams(paramPointers, isFunctionParam) {
    let result = '';

    for(let iter = 0; iter < paramPointers.length; iter++) {
        const eachParam = paramPointers[iter];
        result += eachParam.key;
        if(isFunctionParam) {
            result += ':' + eachParam.type;
            if(eachParam.value) {
                result += ' = ' + eachParam.value;
            }
        }
        if(iter < paramPointers.length-1) result += ', ';
    }

    return result;
}

/** @param {string} data */
function writeRenderApi(data) {
    const filePath = path.resolve(__dirname, '../src/display/renderer/RenderAPI.ts');
    fs.writeFileSync(filePath, data, {encoding : 'utf-8'});
}

module.exports = RenderInstructsBinder;