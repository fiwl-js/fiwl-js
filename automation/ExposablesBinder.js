const fs = require('fs');
const path = require('path');

/**
 *  Imports everything inside /src/environment/exposables/
 *  directory into /src/environment/FIWLApplication.ts
 *  
 *  @returns {void}
 */
function ExposablesBinder() {
    console.log('AUTOMATION: ExposablesBinder');
    console.log(" - Under development, skipping...\n");
}

/** @returns {string} */
function getFIWLApplication() {
    const filePath = path.resolve(__dirname, '../src/environment/FIWLApplication.ts');
    return fs.readFileSync(filePath, {encoding : 'utf-8'});
}

/**
 *  @typedef {object} AutofieldPointer
 *  @property {number} start
 *  @property {number} end
**/

/**
 *  @param {string} fiwlAppScript 
 *  @returns {string}
 */
function cleanAutoField(fiwlAppScript) {
    const autofields = findAutofields(fiwlAppScript);
    /** @todo Continue... */
}

/**
 *  @param {string} fiwlAppScript
 *  @returns {Array<AutofieldPointer>}
 */
function findAutofields(fiwlAppScript) {
    const startTag = '//autofield-start//';
    const endTag = '//autofield-end//';

    /** @type {Array<AutofieldPointer>} */
    let result = [];

    let cursor = 0;
    let isInAutofield = false;
    while(cursor >= 0 && cursor < fiwlAppScript.length) {
        if(!isInAutofield) {
            cursor = fiwlAppScript.indexOf(startTag, cursor);
        } else {
            const start = cursor;
            cursor = fiwlAppScript.indexOf(endTag, cursor);
            const end = cursor + endTag.length;
            autofields.push({
                'start' : start,
                'end'   : end
            });
        }
        isInAutofield = !isInAutofield;
    }

    return result;
}

/** @returns {Array<string>} */
function getAllExposables() {
    const directoryPath = path.resolve(__dirname, '../src/environment/exposables');
    const files = fs.readdirSync(directoryPath);

    /** @type {Array<string>} */
    let result = []
    for(let iter = 0; iter < files.length; iter++) {
        const eachFileName = files[iter];
        const eachFilePath = path.join(directoryPath, eachFileName);
        const eachData = fs.readFileSync(eachFilePath, {encoding : 'utf-8'});
        result.push(eachData);
    }
    
    return result;
}

module.exports = ExposablesBinder