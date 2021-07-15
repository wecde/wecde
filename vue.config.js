module.exports = {
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
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: true,
    },
  },

  transpileDependencies: ["vuetify"],

  productionSourceMap: process.env.NODE_ENV != "production",
};
