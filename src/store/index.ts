import { store as storeSsr } from "quasar/wrappers";
import { InjectionKey } from "vue";
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from "vuex";
import createPersistedState from "vuex-persistedstate";

import clipboardFs from "./clipboard-fs";
import type { ClipboardFStateInterface } from "./clipboard-fs/state";
import editor from "./editor";
import type { EditorStateInterface } from "./editor/state";
import gitConfigs from "./git-configs";
import type { GitConfigsStateInterface } from "./git-configs/state";
import settings from "./settings";
import type { SettingsStateInterface } from "./settings/state";
import system from "./system";
import type { SystemStateInterface } from "./system/state";
import terminal from "./terminal";
import type { TerminalStateInterface } from "./terminal/state";
import watcher from "./watcher";

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export type StateInterface = {
  readonly "clipboard-fs": ClipboardFStateInterface;
  readonly editor: EditorStateInterface;
  readonly settings: SettingsStateInterface;
  readonly system: SystemStateInterface;
  readonly terminal: TerminalStateInterface;
  readonly "git-configs": GitConfigsStateInterface;
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

export default storeSsr(function (/* { ssrContext } */) {
  const store = createStore<StateInterface>({
    modules: {
      "clipboard-fs": clipboardFs,
      editor,
      settings,
      system,
      terminal,
      "git-configs": gitConfigs,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING,
    plugins: [
      createPersistedState({
        paths: [
          "settings",
          "editor",
          "bookmark-labs",
          "git-configs",
        ],
      }),
    ],
  });

  watcher(store);

  return store;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
