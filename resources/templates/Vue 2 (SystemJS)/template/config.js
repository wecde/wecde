self.require = function () {
  if (arguments[0].endsWith("!!")) {
    return arguments[0].replace(/@\//, "/src/").replace(/\!{2}$/, "");
  }

  return System.import(...arguments);
};
self.import = self.require;
self.importVue = (path) => {
  return (resolve, reject) => {
    SystemJS.import(path)
      .then((module) => {
        resolve(module.default);
      })
      .catch((err) => {
        reject(err);
      });
  };
};

SystemJS.config({
  baseURL: "https://unpkg.com/",
  defaultExtension: true,
  meta: {
    "*.vue": {
      loader: "vue-loader",
    },
    "*.css": {
      loader: "css-loader",
    },
    "*.scss": {
      loader: "sass-loader",
    },
    "*.sass": {
      loader: "sass-loader",
    },
  },

  map: {
    "vue-loader": "systemjs-vue-loader@latest",
    "vue-template-compiler": "vue-template-compiler@latest",
    "vue-template-es2015-compiler": "vue-template-es2015-compiler@latest",
    "sass.js": "sass.js@latest",
    "sass-loader": "systemjs-sass-loader@latest",
    less: "less@latest",
    acorn: "acorn@latest",
    "plugin-babel": "systemjs-plugin-babel@latest/plugin-babel.js",
    "systemjs-babel-build":
      "systemjs-plugin-babel@latest/systemjs-babel-browser.js",
    "css-loader": "systemjs-plugin-css@latest",
  },

  paths: {
    "@/": "/src/",
  },

  packages: {
    vue: {
      main: "dist/vue.common.prod.js",
    },
    "vue-template-es2015-compiler": {
      main: "index.js",
    },
  },
  transpiler: "plugin-babel",
});

SystemJS.import("./src/main.js").catch(console.error.bind(console));
