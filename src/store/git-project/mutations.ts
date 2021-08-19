import { MutationTree } from "vuex";

import { GitProjectStateInterface } from "./state";

const mutation: MutationTree<GitProjectStateInterface> = {
  reset(state) {
    state.status = "unknown";
    state.gitignore = "";
    state.matrix.loading = false;

    // eslint-disable-next-line functional/no-loop-statement
    for (const file in state.matrix.value) {
      delete state.matrix.value[file];
    }
  },
  "set:status"(state, value: "unknown" | "unready" | "ready"): void {
    state.status = value;
  },
  "set:ignore"(state, value: string): void {
    state.gitignore = value;
  },
  "update:matrix"(
    state,
    statusMatrixResult: readonly (readonly [
      string,
      0 | 1,
      0 | 1 | 2,
      0 | 1 | 2 | 3
    ])[]
  ) {
    statusMatrixResult.forEach(([filepath, ...statusMatrix]) => {
      state.matrix.value[filepath] = statusMatrix;
    });
  },
  "set:matrix.loading"({ matrix }, value: boolean) {
    // eslint-disable-next-line functional/immutable-data
    matrix.loading = value;
  },
};

export default mutation;
