import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import system from "./modules/system";
import settings from "./modules/settings";
import files from "./modules/files";
import editor from "./modules/editor";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    system,
    settings,
    files,
    editor,
  },
  plugins: [
    createPersistedState({
      paths: ["files", "settings", "system", "editor"],
    }),
  ],
});
