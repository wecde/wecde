import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import system, { State as StateSystem } from "./modules/system";
import settings, { State as StateSettings } from "./modules/settings";
import editor, { State as StateEditor } from "./modules/editor";
import storeScroll, { State as StateStoreScroll } from "./modules/store-scroll";
import terminal, { State as StateTerminal } from "./modules/terminal";
import progress, { State as StateProgress } from "./modules/progress";

Vue.use(Vuex);

export default new Vuex.Store<{
  system: StateSystem;
  settings: StateSettings;
  editor: StateEditor;
  storeScroll: StateStoreScroll;
  terminal: StateTerminal;
  progress: StateProgress;
}>({
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
