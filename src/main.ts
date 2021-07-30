import eruda from "eruda2";

(self as any).setConsoleState = (state: boolean): void => {
  if (state) {
    if (!(self as any).__ERUDA__) {
      eruda.init({
        useShadowDom: true,
        autoScale: true,

        defaults: {
          displaySize: 40,
          transparency: 0.9,
          theme: "Monokai Pro",
        },
      });
      (self as any).__ERUDA__ = true;
    }
  } else {
    eruda?.destroy();
    (self as any).__ERUDA__ = false;
  }
};

import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import i18n from "./i18n";
import vuetify from "./plugins/vuetify";
import timeagojs from "vue-timeago.js";
import VueCompositionAPI, { createApp, h } from "@vue/composition-api";

/// * register module and WebServer ( not start )
import "./webserver";

Vue.use(VueCompositionAPI);
Vue.config.productionTip = false;
Vue.config.performance = true;

(Vue.util as any).defineReactive(self, "__ERUDA__", false);

const vm = createApp({
  router,
  store,
  vuetify,
  i18n,
  render: () => h(App),
});
vm.use(timeagojs);
vm.mount("#app");
