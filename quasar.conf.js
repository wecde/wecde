/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli/quasar-conf-js

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

/* eslint-disable @typescript-eslint/no-var-requires */
const { ESBuildMinifyPlugin } = require("esbuild-loader");
/* eslint-disable @typescript-eslint/no-var-requires */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
/* eslint-disable @typescript-eslint/no-var-requires */
const { configure } = require("quasar/wrappers");
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");

// eslint-disable-next-line functional/immutable-data
module.exports = configure(function (ctx) {
  return {
    htmlVariables: {
      productName: "Wecde",
    },
    // https://v2.quasar.dev/quasar-cli/supporting-ts
    supportTS: {
      tsCheckerConfig: process.env.NODE_ENV === "production" ? {
        eslint: {
          enabled: true,
          files: "./src/**/*.{ts,tsx,js,jsx,vue}",
        },
      } : false,
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: [
      "capacitor",
      "theme",
      "i18n",
      "vue-timeago.js",
      "webserver",
      "dev-tools",
    ],

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      "mdi-v5",
      // 'fontawesome-v5',
      // 'eva-icons',
      "themify",
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      // "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: "hash", // available values: 'hash', 'history'

      // transpile: false,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://v2.quasar.dev/options/rtl-support
      // preloadChunks: true,
      showProgress: true,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      // chainWebpack(rules) {},
      extendWebpack(cfg) {
        // eslint-disable-next-line functional/immutable-data
        cfg.module.rules.push({
          test: /\.zip$/,
          loader: "file-loader",
          options: {
            name() {
              if (process.env.NODE_ENV === "development") {
                return "[path][name].[ext]";
              }

              return "archives/[path][name].[ext]";
              // return "[contenthash].[ext]";
            },
          },
        });

        // eslint-disable-next-line functional/immutable-data
        cfg.module.rules = cfg.module.rules.map((rule) => {
          if (rule.test.toString() === "/\\.js$/") {
            return {
              ...rule,
              use: void 0,
              test: /\.js$/,
              loader: "esbuild-loader",
              options: {
                loader: "js",
                target: "es2015",
              },
            };
          }

          if (rule.test.toString() === "/\\.ts$/") {
            return {
              ...rule,
              use: void 0,
              test: /\.ts$/,
              loader: "esbuild-loader",
              options: {
                loader: "ts",
                target: "es2015",
              },
            };
          }

          return rule;
        });

        // eslint-disable-next-line functional/immutable-data
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          modules: path.resolve("./src/modules"),
          path$: "path-cross/build/module/index.js",
        };

        // eslint-disable-next-line functional/immutable-data
        cfg.plugins.push(
          new webpack.ProvidePlugin({
            // process: "process/browser",
            Buffer: ["buffer", "Buffer"],
          }),
          new NodePolyfillPlugin()
        );

        // eslint-disable-next-line functional/immutable-data
        cfg.optimization.minimizer = cfg.optimization.minimizer?.map(
          (minimizer) => {
            if (minimizer.constructor.name === "TerserPlugin") {
              return new ESBuildMinifyPlugin({
                target: "es2015",
                css: true, // Apply minification to CSS assets
              });
            }

            return minimizer;
          }
        );
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: false, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      config: {},

      iconSet: "mdi-v5", // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ["Notify", "Dialog"],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)

      chainWebpackWebserver(/* chain */) {
        //
      },

      middlewares: [
        ctx.prod ? "compression" : "",
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: "GenerateSW", // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      chainWebpackCustomSW(/* chain */) {
        //
      },

      manifest: {
        name: "Wecde",
        short_name: "Wecde",
        description: "A Quasar Framework app",
        display: "standalone",
        orientation: "portrait",
        background_color: "#121212",
        theme_color: "#010101",
        icons: [
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
      backButtonExit: true,
      backButton: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "wecde",
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpack(/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackMain also available besides this chainWebpackMain
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload(/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackPreload also available besides this chainWebpackPreload
      },
    },
  };
});
