import fs from "modules/filesystem";
import { join } from "path-cross";
import gitWorker from "src/worker/git";
import type { ActionTree } from "vuex";

import type { StateInterface } from "../index";

import type { GitProjectStateInterface } from "./state";

const actions: ActionTree<GitProjectStateInterface, StateInterface> = {
  async checkDotGit({ commit, rootState }): Promise<void> {
    commit("setState", "loading");
    try {
      if (
        rootState.editor.project &&
        (await fs.stat(join(rootState.editor.project, ".git/index"))).isFile()
      ) {
        commit("setState", "ready");
      } else {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("DOT_GIT_IS_NOT_DIRECTORY");
      }
    } catch {
      commit("setState", "unready");
    }
  },
  async loadIgnore({ commit, rootState }): Promise<void> {
    try {
      if (rootState.editor.project) {
        commit(
          "setIgnore",
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
      commit("setIgnore", "");
    }
  },
  async updateStatusDir(
    { commit, rootState, state },
    filepaths: readonly string[] = ["."]
  ) {
    commit("set:matrix.loading", true);
    if (rootState.editor.project && state.state === "ready") {
      const statusMatrixResult = await gitWorker.statusMatrix({
        dir: rootState.editor.project,
        filepaths: [...filepaths],
      });

      commit("updateMatrix", statusMatrixResult);
    }
    commit("set:matrix.loading", false);
  },
  async refresh({ dispatch }): Promise<void> {
    await Promise.all([dispatch("checkDotGit"), dispatch("loadIgnore")]);
    await dispatch("updateStatusDir");
  },
};

export default actions;
