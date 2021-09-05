import { statusMatrix } from "isomorphic-git";
import { join } from "path-cross";
import fs from "src/modules/fs";
import { createTimeoutBy } from "src/utils";
import { ActionTree } from "vuex";

import { StateInterface } from "..";

import { EditorStateInterface } from "./state";

const actions: ActionTree<EditorStateInterface, StateInterface> = {
  "update:matrix-of-filepath"({ state, commit }, filepath = "."): void {
    createTimeoutBy(
      "update status matrix",
      async () => {
        if (
          state.project &&
          (await fs.isFile(join(state.project, ".git/index")))
        ) {
          const filepaths = [filepath];

          commit("set:git.statusMatrix.loading", true);

          const matrix = (
            await statusMatrix({
              fs,
              dir: state.project,
              filepaths,
            })
          ).reduce((obj, [filepath, ...value]) => {
            // eslint-disable-next-line functional/immutable-data
            obj[filepath] = value;
            return obj;
          }, {} as EditorStateInterface["git"]["statusMatrix"]["matrix"]);

          commit(
            "filter:git.statusMatrix.matrix",
            (filepath: string) =>
              !filepaths.some(
                (base) =>
                  fs.isParentDir(filepath, base) || fs.isEqual(filepath, base)
              )
          );
          commit("assign:git.statusMatrix.matrix", matrix);

          commit("set:git.statusMatrix.loading", false);
        }
      },
      1
    );
  },
};

export default actions;
