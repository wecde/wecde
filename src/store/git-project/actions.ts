import fs from "modules/filesystem";
import { join } from "path-cross";
import { useGitWorker } from "src/worker/git";
import type { ActionTree } from "vuex";

import type { StateInterface } from "../index";

import type { GitProjectStateInterface } from "./state";

const actions: ActionTree<GitProjectStateInterface, StateInterface> = {
  async checkDotGit({ commit, rootState }): Promise<void> {
    commit("set:status", "unknown");
    try {
      console.log(rootState.editor.project);
      if (
        rootState.editor.project &&
        (await fs.stat(join(rootState.editor.project, ".git/index"))).isFile()
      ) {
        commit("set:status", "ready");
      } else {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("DOT_GIT_IS_NOT_DIRECTORY");
      }
    } catch {
      commit("set:status", "unready");
    }
  },
  async loadIgnore({ commit, rootState }): Promise<void> {
    try {
      if (rootState.editor.project) {
        commit(
          "set:ignore",
          await fs.readFile(
            join(rootState.editor.project, ".gitignore"),
            "utf8"
          )
        );
      } else {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("PROJECT_UNKNOWN");
      }
    } catch {
      commit("set:ignore", "");
    }
  },
  async updateMatrix(
    { commit, rootState, state },
    filepaths: readonly string[] = ["."]
  ) {
    commit("set:matrix.loading", true);
    if (rootState.editor.project && state.status === "ready") {
      const statusMatrixResult = await useGitWorker().statusMatrix({
        fs,
        dir: rootState.editor.project,
        filepaths: [...filepaths],
      });

      commit("update:matrix", statusMatrixResult);
    }
    commit("set:matrix.loading", false);
  },
  async refresh({ dispatch, commit }): Promise<void> {
    commit("reset");
    await Promise.all([dispatch("checkDotGit"), dispatch("loadIgnore")]);
    await dispatch("updateMatrix");
  },
};

export default actions;
