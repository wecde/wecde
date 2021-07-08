module.exports = {
  transpileDependencies: ["vuetify"],

  // pwa: {
  //   name: "Shin Code Editor",
  //   themeColor: "#222222",
  //   msTileColor: "#000000",
  //   appleMobileWebAppCapable: "yes",
  //   appleMobileWebAppStatusBarStyle: "black",
  //   workboxPluginMode: "InjectManifest",
  // },
  configureWebpack: {
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
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  }
};
