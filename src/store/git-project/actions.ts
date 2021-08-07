import { join } from "path-cross";
import { readFile, stat } from "src/modules/filesystem";
import { rawText } from "src/utils";
import type { ActionTree } from "vuex";

import type { StateInterface } from "../index";

import type { GitProjectStateInterface } from "./state";

const actions: ActionTree<GitProjectStateInterface, StateInterface> = {
  async checkDotGit({ commit, rootState }): Promise<void> {
    commit("setState", "loading");
    try {
      if (
        rootState.editor.project &&
        (await stat(join(rootState.editor.project, ".git"))).type ===
          "directory"
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
          rawText(await readFile(join(rootState.editor.project, ".gitignore")))
        );
      } else {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("PROJECT_UNKNOWN");
      }
    } catch {
      commit("setIgnore", "");
    }
  },
  async refresh({ dispatch }): Promise<void> {
    await Promise.all([dispatch("checkDotGit"), dispatch("loadIgnore")]);
  },
};

export default actions;
