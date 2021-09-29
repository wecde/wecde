import git from "isomorphic-git";
import { join } from "path-cross";
import fs from "src/modules/fs";
import { ActionTree } from "vuex";

import { StateInterface } from "..";

import { EditorStateInterface } from "./state";

const actions: ActionTree<EditorStateInterface, StateInterface> = {
  async "update:matrix-of-filepath"(
    { state, commit },
    // eslint-disable-next-line functional/prefer-readonly-type
    filepaths: string[] = ["."]
  ): Promise<void> {
    if (state.project && (await fs.isFile(join(state.project, ".git/HEAD")))) {
      commit("set:git.statusMatrix.loading", true);

      commit(
        "filter:git.statusMatrix.matrix",
        (filepath: string) =>
          !filepaths.some(
            (base) =>
              fs.isParentDir(base, filepath) ||
              fs.isEqual(filepath, base) ||
              fs.relatively(base) === "./"
          )
      );

      const matrix =
        (
          await git.statusMatrix({
            fs,
            dir: state.project,
            filepaths,
          })
        )?.reduce((obj, [filepath, ...value]) => {
          // eslint-disable-next-line functional/immutable-data
          obj[filepath] = value;
          return obj;
        }, {} as EditorStateInterface["git"]["statusMatrix"]["matrix"]) || {};

      commit("assign:git.statusMatrix.matrix", matrix);

      commit("set:git.statusMatrix.loading", false);
    } else {
      commit("filter:git.statusMatrix.matrix", () => false);
    }
  },
};

export default actions;
