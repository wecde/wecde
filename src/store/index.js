import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import system from "./modules/system";
import settings from "./modules/settings";
import editor from "./modules/editor";
import storeScroll from "./modules/store-scroll";
import terminal from "./modules/terminal";
import progress from "./modules/progress";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    system,
    settings,
    editor,
    storeScroll,
    terminal,
    progress,
  },
  plugins: [
    createPersistedState({
      paths: ["settings", "system", "editor", "storeScroll"],
    }),
  ],
});
