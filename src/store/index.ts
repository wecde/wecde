import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import hydrator from "./hydrator";

import system, { State as StateSystem } from "./modules/system";
import settings, { State as StateSettings } from "./modules/settings";
import editor, { State as StateEditor } from "./modules/editor";
import terminal, { State as StateTerminal } from "./modules/terminal";
import bookmarkLabs, {
  State as StateBookmarkLabs,
} from "./modules/bookmark-labs";
import clipboardFs, { State as StateClipboardFs } from "./modules/clipboard-fs";
import gitProject, { State as StateGitProject } from "./modules/git-project";

Vue.use(Vuex);

const store = new Vuex.Store<{
  system: StateSystem;
  settings: StateSettings;
  editor: StateEditor;
  terminal: StateTerminal;
  "bookmark-labs": StateBookmarkLabs;
  "clipboard-fs": StateClipboardFs;
  "git-project": StateGitProject;
}>({
  strict: process.env.NODE_ENV !== "production",
  modules: {
    system,
    settings,
    editor,
    terminal,
    "bookmark-labs": bookmarkLabs,
    "clipboard-fs": clipboardFs,
    "git-project": gitProject,
  },
  plugins: [
    createPersistedState({
      paths: [
        "settings",
        "system",
        "editor.project",
        "editor.sessions",
        "editor.session",
        "editor.historySession",
        "scrollEnhance",
        "bookmark-labs",
      ],
    }),
  ],
});

hydrator(store);

export default store;
