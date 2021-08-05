import ignore from "ignore";
import parseIgnore from "parse-gitignore";
import { join, relative } from "path-cross";
import { readFile, stat } from "src/modules/filesystem";
import { listFiles, scanDir, status } from "src/modules/git";
import { isParentFolder, rawText } from "src/utils";
import type { ActionTree } from "vuex";

import type { StateInterface } from "../index";

import type { GitProjectStateInterface } from "./state";

const actions: ActionTree<GitProjectStateInterface, StateInterface> = {
  clean({ commit, state, getters }): void {
    // eslint-disable-next-line functional/no-loop-statement
    for (const filepath in state.matrixStatus) {
      if (getters["ignored"](filepath)) {
        commit("delete", filepath);
      }
    }
  },
  async init({ commit, rootState }): Promise<void> {
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
  async refreshFile(
    { commit, rootState },
    {
      fullpath,
      cache = {},
    }: {
      readonly fullpath: string;
      readonly cache: Record<string, unknown>;
    }
  ): Promise<void> {
    if (
      rootState.editor.project &&
      isParentFolder(rootState.editor.project, fullpath)
    ) {
      const filepath = relative(rootState.editor.project, fullpath);

      if (isParentFolder(".git", filepath) === false) {
        commit("setGitStatus", {
          filepath,
          status: await status({
            dir: rootState.editor.project,
            filepath,
            cache,
          }),
        });
      } else {
        console.warn("Can't refresh git status file(s) of the .git");
      }
    }
  },
  async refreshFolder(
    { rootState, state, dispatch },
    {
      fileOther = [],
      fullpath,
    }: {
      readonly fileOther: readonly string[];
      readonly fullpath: string;
    }
  ): Promise<void> {
    if (rootState.editor.project && state.state === "ready") {
      const ig = ignore().add([".git", ...parseIgnore(state.gitignore)]);

      const list = new Set(
        // eslint-disable-next-line functional/immutable-data
        [
          ...fileOther,
          ...(await scanDir(fullpath, ig, rootState.editor.project)).map(
            (item) => relative(rootState.editor.project as string, item)
          ),
        ]
          .sort()
          .sort((a, b) => {
            return a.split("/").length - b.split("/").length;
          })
      );

      // eslint-disable-next-line functional/no-let
      let cache = Object.create(null);

      // eslint-disable-next-line functional/no-loop-statement
      for (const filepath of list) {
        await dispatch("refreshFile", {
          fullpath: join(rootState.editor.project, filepath),
          cache,
        });
      }

      void dispatch("clean");

      cache = null;
    }
  },
  async refresh({ state, rootState, commit, dispatch }): Promise<void> {
    await dispatch("init");
    await dispatch("loadIgnore");
    if (rootState.editor.project && state.state === "ready") {
      commit("setGitStatusLoading", true);

      await dispatch("refreshFolder", {
        fileOther: await listFiles({
          dir: rootState.editor.project,
        }),
        fullpath: rootState.editor.project,
      });

      commit("setGitStatusLoading", false);
    } else {
      commit("clearGitStatus");
    }
  },
};

export default actions;
