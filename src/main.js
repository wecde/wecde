import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./plugins/router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import asyncComputed from "vue-async-computed";
import timeagojs from "vue-timeago.js"

Vue.use(asyncComputed);
Vue.use(timeagojs)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
