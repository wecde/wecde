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
import VueCompositionAPI from "@vue/composition-api";
import Bus from "vue-bus";

/// * register module and WebServer ( not start )
import "./webserver";

Vue.use(VueCompositionAPI);
Vue.use(timeagojs);
Vue.use(Bus);
Vue.config.productionTip = false;

(Vue.util as any).defineReactive(self, "__ERUDA__", false);

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
