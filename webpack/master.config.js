/**
 *  master.config.js = configures webpack generally
**/

const path = require('path');
const AutomationPlugin = require('./automation.plugin');

// Configure how ./bootable.ts and ./src/* being bundled
module.exports = {
    entry   : {
        fiwl      : path.resolve(__dirname, "../fiwl.ts"),
        index     : path.resolve(__dirname, "../index.ts"),
        'index.m' : path.resolve(__dirname, "../index.m.ts"),
    },
    output  : {
        filename      : "[name].js",
        path          : path.resolve(__dirname, "../build"),
        publicPath    : "/"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts','.js']
    },
    plugins: [
        new AutomationPlugin()
    ]
};