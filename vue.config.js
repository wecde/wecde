module.exports = {
  transpileDependencies: ["vuetify"],
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

                return "archives/[name].[ext]";
                // return "[contenthash].[ext]";
              },
            },
          },
        },
      ],
    },
  },
  // pwa: {
  //   name: "Shin Code Editor",
  //   themeColor: "#222222",
  //   msTileColor: "#000000",
  //   appleMobileWebAppCapable: "yes",
  //   appleMobileWebAppStatusBarStyle: "black",
  //   workboxPluginMode: "InjectManifest",
  // },
};
