import Vue from "vue";
import Vuex from "vuex";

import system from "./modules/system";
import settings from "./modules/settings";
import files from "./modules/files";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    system,
    settings,
    files,
  },
});
