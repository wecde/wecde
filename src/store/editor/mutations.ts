import { MutationTree } from "vuex";

import { EditorStateInterface } from "./state";

const mutation: MutationTree<EditorStateInterface> = {
  "set:project"(state, value: string): void {
    state.project = value;
  },
  "set:git.statusMatrix.loading"(state, value: boolean): void {
    state.git.statusMatrix.loading = value;
  },
  "set:git.statusMatrix.matrix"(
    state,
    value: EditorStateInterface["git"]["statusMatrix"]["matrix"]
  ): void {
    // first. clear;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("filter/assign:git.statusMatrix.matrix", () => false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("editor/assign:git.statusMatrix.matrix", value);
  },
  "assign:git.statusMatrix.matrix"(
    state,
    value: EditorStateInterface["git"]["statusMatrix"]["matrix"]
  ): void {
    // append value;
    // eslint-disable-next-line functional/no-loop-statement
    for (const filepath in value) {
      if (filepath.replace(/\s|\u0000/g, "") !== "") {
        // filter " "
        state.git.statusMatrix.matrix[filepath] = value[filepath];
      }
    }
  },
  "filter:git.statusMatrix.matrix"(state, filter): void {
    // eslint-disable-next-line functional/no-loop-statement
    for (const filepath in state.git.statusMatrix.matrix) {
      if (filter(filepath) === false) {
        delete state.git.statusMatrix.matrix[filepath];
      }
    }
  },
};

export default mutation;
