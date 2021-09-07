import { MutationTree } from "vuex";

import { ClipboardFStateInterface } from "./state";

const mutation: MutationTree<ClipboardFStateInterface> = {
  cut(state, path: string): void {
    state.action = "cut";

    state.clipboardFile = path;
  },
  copy(state, path: string): void {
    state.action = "copy";

    state.clipboardFile = path;
  },
  done(state) {
    state.action = "copy";

    state.clipboardFile = null;
  },
};

export default mutation;
