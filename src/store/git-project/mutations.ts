import { MutationTree } from "vuex";

import { GitProjectStateInterface } from "./state";

const mutation: MutationTree<GitProjectStateInterface> = {
  setState(state, value: "loading" | "unready" | "ready"): void {
    state.state = value;
  },

  clearGitStatus(state): void {
    state.matrixStatus = {};
  },
  setGitStatus(
    state,
    {
      filepath,
      status,
    }: {
      readonly filepath: string;
      readonly status: string;
    }
  ): void {
    state.matrixStatus = {
      ...state.matrixStatus,
      [filepath]: status,
    };
  },

  setGitStatusLoading(state, value: boolean): void {
    state.isLoading = value;
  },
  setIgnore(state, value: string): void {
    state.gitignore = value;
  },
  delete(state, filepath: string): void {
    delete state.matrixStatus[filepath];
  },
};

export default mutation;
