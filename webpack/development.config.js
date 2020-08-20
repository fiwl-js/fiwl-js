/**
 *  development.config.js = configures webpack for `npm start`
 */

const path = require("path");
const fs = require("fs");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const master = require("./master.config");

// Inject app name, description, and metadata from manifest.json
// into index.html for SEO optimalization
let appName = "Blank App";
let icon = null;
let metadata = {
  description: "This is a FIWL-based app",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
};
if (fs.existsSync("development/manifest.json")) {
  let manifest = JSON.parse(
    fs.readFileSync(path.normalize("development/manifest.json"))
  );
  if (typeof manifest == "object") {
    if (typeof manifest.name == "string") appName = manifest.name;
    if (typeof manifest.description == "string")
      metadata.description = manifest.description;
    if (typeof manifest.meta == "object")
      for (const eachKey in manifest.meta) {
        metadata[eachKey] = manifest.meta[eachKey];
      }
    if (typeof manifest.icon == "string") {
      const iconPath = "development/" + manifest.icon.replace(/^\//, "");
      if (fs.existsSync(path.resolve(__dirname, "../" + iconPath))) {
        icon = iconPath;
      }
    }
  }
}

const development = {
  mode: "development",
  entry: [path.resolve(__dirname, "../fiwl.ts")],
  output: {
    filename: "fiwl.js",
    path: path.resolve(__dirname, "../development"),
    publicPath: "/",
  },
  devServer: {
    contentBase: path.resolve(__dirname, "../development"),
    watchContentBase: true,
    historyApiFallback: {
      rewrites: [
        {
          from: /((.*\/)|^)index\.(html?|php|asp|cgi)\/?$/,
          to: "/",
        },
      ],
    },
    host: "localhost",
    port: "8080",
    writeToDisk: true,
    //disableHostCheck : true
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      filename: "./index.html",
      title: appName,
      favicon: icon,
      meta: metadata,
    }),
  ],
};

module.exports = merge(master, development);
