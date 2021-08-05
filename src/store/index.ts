import { store as storeSsr } from "quasar/wrappers";
import { InjectionKey } from "vue";
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from "vuex";
import createPersistedState from "vuex-persistedstate";

import bookmarkLabs from "./bookmark-labs";
import type { BookmarkLabsStateInterface } from "./bookmark-labs/state";
import clipboardFs from "./clipboard-fs";
import type { ClipboardFStateInterface } from "./clipboard-fs/state";
import editor from "./editor";
import type { EditorStateInterface } from "./editor/state";
import gitProject from "./git-project";
import type { GitProjectStateInterface } from "./git-project/state";
import hydrator from "./hydrator";
import settings from "./settings";
import type { SettingsStateInterface } from "./settings/state";
import system from "./system";
import type { SystemStateInterface } from "./system/state";
import terminal from "./terminal";
import type { TerminalStateInterface } from "./terminal/state";

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export type StateInterface = {
  readonly "bookmark-labs": BookmarkLabsStateInterface;
  readonly "clipboard-fs": ClipboardFStateInterface;
  readonly editor: EditorStateInterface;
  readonly "git-project": GitProjectStateInterface;
  readonly settings: SettingsStateInterface;
  readonly system: SystemStateInterface;
  readonly terminal: TerminalStateInterface;
};

// provide typings for `this.$store`
declare module "@vue/runtime-core" {
  // eslint-disable-next-line functional/prefer-type-literal
  export interface ComponentCustomProperties {
    readonly $store: VuexStore<StateInterface>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> =
  Symbol("vuex-key");

export const store = createStore<StateInterface>({
  modules: {
    "bookmark-labs": bookmarkLabs,
    "clipboard-fs": clipboardFs,
    editor,
    "git-project": gitProject,
    settings,
    system,
    terminal,
  },

  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: !!process.env.DEBUGGING,
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

export default storeSsr(function (/* { ssrContext } */) {
  return store;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
