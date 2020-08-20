const fs = require('fs');
const path = require('path');

//  Import module for JSDoc:
/** @typedef {import('webpack').Compiler} WebpackCompiler */
/** @typedef {import('webpack').compilation} WebpackCompilation */

/** Run automation with webpack for FIWL development */
class AutomationPlugin {
    
    /**
     *  @param {WebpackCompiler} compiler
     *  @returns {void}
     */
    apply(compiler) {
        compiler.hooks.environment.tap(
            'AutomationPlugin',
            () => {
                const dirPath = path.resolve(__dirname, '../automation');
                const files = fs.readdirSync(dirPath);
                for(let iter = 0; iter < files.length; iter++) {
                    const eachFileName = files[iter];
                    if(!eachFileName.endsWith('.js')) continue;
                    const eachFilePath = path.join(dirPath, eachFileName);
                    
                    /** @type {() => void} */
                    const eachScript = require(eachFilePath);
                    eachScript();
                }
            }
        )
    }

}

module.exports = AutomationPlugin;