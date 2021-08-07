import { MutationTree } from "vuex";

import { GitProjectStateInterface } from "./state";

const mutation: MutationTree<GitProjectStateInterface> = {
  setState(state, value: "loading" | "unready" | "ready"): void {
    state.state = value;
  },
  setIgnore(state, value: string): void {
    state.gitignore = value;
  },
};

export default mutation;
