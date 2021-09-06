import { MutationTree } from "vuex";

import { SystemStateInterface } from "./state";

const mutation: MutationTree<SystemStateInterface> = {
  setNavigation(state, value: boolean): void {
    state.navigation = value;
  },
  "set:navTabGit"(state, value: boolean) {
    state.navTabGit = value;
  }
};

export default mutation;
