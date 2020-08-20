/**
 *  master.config.js = configures webpack for `npm run build`
**/

const merge = require("webpack-merge");

const master = require("./master.config");
const production = {
    "mode"    : "production"
};

module.exports = merge(master, production);