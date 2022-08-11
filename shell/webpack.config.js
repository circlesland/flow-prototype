const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const sveltePreprocess = require("svelte-preprocess");
const webpack = require("webpack");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";
const DEBUG = !process.argv.includes("--release");
const VERBOSE = process.argv.includes("--verbose");

const sveltePath = path.resolve("node_modules", "svelte");

module.exports = {
  mode,
  devtool: prod ? false : "inline-cheap-module-source-map",
  entry: {
    bundle: ["./src/main.ts"],
  },
  node: {
    fs: "empty",
  },
  resolve: {
    alias: {
      svelte: sveltePath,
      src: path.resolve(__dirname, "src"),
      libs: path.resolve(__dirname, "libs"),
    },
    extensions: [".mjs", ".tsx", ".ts", ".js", ".svelte", ".svx"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE,
  },
  output: {
    path: __dirname + "/public",
    filename: "bundle.js",
    chunkFilename: "bundle.[id].js",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "postcss-loader",
        ],
      },
      {
        test: /.(svelte|html|svx)$/,
        use: {
          loader: "svelte-loader-hot",
          options: {
            emitCss: true,
            hotReload: true,
            preprocess: sveltePreprocess({}),
          },
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "bundle.[name].css",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(mode),
    }),
  ],
  optimization: {
    minimize: prod,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  devServer: {
    watchContentBase: true,
    compress: false,
    contentBase: [path.join(__dirname, "public")],
    port: 3333,
    host: "localhost",
    open: true,
    https: false,
  },
};
