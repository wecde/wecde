import type { DefineComponent } from "vue";
import { MutationTree } from "vuex";

import { ClipboardFStateInterface } from "./state";

export const storeVm = new Map<number, DefineComponent>();

type Uris = readonly {
  readonly path: string;
  readonly vue: DefineComponent;
}[];

// eslint-disable-next-line functional/no-let
export let _uuid = 0;
const mutation: MutationTree<ClipboardFStateInterface> = {
  cut(state, uris: Uris): void {
    state.action = "cut";

    state.objects.forEach(({ vue }) => {
      storeVm.delete(vue);
    });
    state.objects.splice(0);

    uris.forEach(({ path, vue }) => {
      const uid = _uuid++;
      if (storeVm.has(uid) === false) {
        storeVm.set(uid, vue);
      }
      state.objects.push({
        path,
        vue: uid,
      });
    });
  },
  copy(state, uris: Uris): void {
    state.action = "copy";

    state.objects.forEach(({ vue }) => {
      storeVm.delete(vue);
    });
    state.objects.splice(0);

    uris.forEach(({ path, vue }) => {
      const uid = _uuid++;
      if (storeVm.has(uid) === false) {
        storeVm.set(uid, vue);
      }
      state.objects.push({
        path,
        vue: uid,
      });
    });
  },
  reset(state): void {
    state.action = "copy";
    state.objects.forEach(({ vue }) => {
      storeVm.delete(vue);
    });
    state.objects.splice(0);
  },
};

export default mutation;
