// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ESBuildMinifyPlugin } = require("esbuild-loader");

module.exports = {
  chainWebpack: (config) => {
    const jsRule = config.module.rule("js");
    jsRule.uses.clear();
    jsRule
      .use("esbuild-loader")
      .loader("esbuild-loader")
      .tap(() => {
        return {
          loader: "js",
          target: "es2015",
        };
      })
      .end();

    const tsRule = config.module.rule("ts");
    tsRule.uses.clear();
    tsRule
      .use("esbuild-loader")
      .loader("esbuild-loader")
      .tap(() => {
        return {
          loader: "ts",
          target: "es2015",
        };
      })
      .end();
  },
  configureWebpack: {
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: "es2015",
          css: true,
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.zip$/,
          use: {
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
          },
        },
      ],
    },
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
    },
  },

  transpileDependencies: ["vuetify"],

  pwa: {
    manifestOptions: {
      name: "Shin Code Editor",
      short_name: "Shin Code Editor",
      start_url: "./",
      display: "standalone",
      theme_color: "#010101",
      icons: [
        {
          src: "/img/icons/favicon@16x16.png",
          sizes: "16x16",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@32x32.png",
          sizes: "32x32",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@60x60.png",
          sizes: "60x60",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@64x64.png",
          sizes: "64x64",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@76x76.png",
          sizes: "76x76",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@120x120.png",
          sizes: "120x120",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@180x180.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/favicon@512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },

    themeColor: "#4DBA87",
    msTileColor: "#000000",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    iconPaths: {
      faviconSVG: "img/icons/favicon.svg",
      favicon32: "img/icons/favicon@32x32.png",
      favicon16: "img/icons/favicon@16x16.png",
      appleTouchIcon: "img/icons/apple-touch-icon@152x152.png",
      maskIcon: "img/icons/safari-pinned-tab.svg",
      msTileImage: "img/icons/msapplication-icon@144x144.png",
    },
    // configure the workbox plugin
    workboxPluginMode: "GenerateSW",
  },
};
