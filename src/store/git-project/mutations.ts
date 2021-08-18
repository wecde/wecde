import { MutationTree } from "vuex";

import { GitProjectStateInterface } from "./state";

const mutation: MutationTree<GitProjectStateInterface> = {
  setState(state, value: "loading" | "unready" | "ready"): void {
    state.state = value;
  },
  setIgnore(state, value: string): void {
    state.gitignore = value;
  },
  updateMatrix(
    state,
    statusMatrixResult: readonly (readonly [
      string,
      0 | 1,
      0 | 1 | 2,
      0 | 1 | 2 | 3
    ])[]
  ) {
    statusMatrixResult.forEach(([filepath, ...statusMatrix]) => {
      state.matrix[filepath] = statusMatrix;
    });
  },
};

export default mutation;
