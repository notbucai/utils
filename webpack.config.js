const path = require("path");
const webpack = require('webpack');
const package = require('./package.json');

module.exports = {
  // mode: "development",
  mode: "production",
  entry: "./src",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "utils.min.js",
    library: "utils",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        exclude: [path.resolve(__dirname, "node_modules")]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  externals: {
    'xlsx': 'XLSX',
    // '_': 'lodash',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner:
        `
      name : ${package.name}
      description: ${package.description}
      author : ${package.author}  
      github : https://github.com/notbucai
      version : ${package.version}
      `
    })
  ],
  devtool: 'source-map'
  // devtool: "inline-source-map"
};