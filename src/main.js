import eruda from "eruda2";

eruda.init();

import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./plugins/router";
import store from "./store";
import i18n from "./plugins/i18n";
import vuetify from "./plugins/vuetify";
import asyncComputed from "vue-async-computed";
import timeagojs from "vue-timeago.js";
import VueCompositionAPI from "@vue/composition-api";

/// * register module and WebServer ( not start )
import "./webserver";

Vue.use(VueCompositionAPI);
Vue.use(asyncComputed);
Vue.use(timeagojs);
Vue.config.productionTip = false;

Vue.prototype.$show = function () {
  this.$store.commit("progress/show");
};

Vue.prototype.$hide = function () {
  this.$store.commit("progress/hide");
};

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
