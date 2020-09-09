/**
 *  analyze.config.js = configures webpack for `npm run analyze`
 **/

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const merge = require("webpack-merge");

const master = require("./master.config");
const analyze = {
  mode: "production",
  plugins: [...master.plugins, new BundleAnalyzerPlugin()],
};

module.exports = merge(master, analyze);
