import { MutationTree } from "vuex";

import { SystemStateInterface } from "./state";

const mutation: MutationTree<SystemStateInterface> = {
  setNavigation(state, value: boolean): void {
    state.navigation = value;
  },
  setProgress(state, value: boolean): void {
    state.progress = value;
  },
};

export default mutation;
