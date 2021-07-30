import type { Module } from "vuex";
import { stat } from "@/modules/filesystem";
import { join, relative } from "path";
import { listFiles, scanDir, status } from "@/modules/git";
import ignore from "ignore";
import parseIgnore from "parse-gitignore";
import { rawText } from "@/utils";
import { readFile } from "@/modules/filesystem";

export interface State {
  state: "loading" | "unready" | "ready";
  isLoading: boolean;
  matrixStatus: {
    [fullpath: string]: string;
  };
  gitignore: string;
}

const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    state: "loading",
    isLoading: false,
    matrixStatus: {},
    gitignore: "",
  },
  mutations: {
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
        filepath: string;
        status: string;
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
  },
  actions: {
    async init({ commit, rootState }): Promise<void> {
      commit("setState", "loading");
      try {
        if (
          (rootState as any).editor.project &&
          (await stat(join((rootState as any).editor.project, ".git"))).type ===
            "directory"
        ) {
          commit("setState", "ready");
        } else {
          throw new Error("DOT_GIT_IS_NOT_DIRECTORY");
        }
      } catch {
        commit("setState", "unready");
      }
    },
    async loadIgnore({ commit, rootState }): Promise<void> {
      try {
        commit(
          "setIgnore",
          rawText(
            await readFile(
              join((rootState as any).editor.project, ".gitignore")
            )
          )
        );
      } catch {
        commit("setIgnore", "");
      }
    },
    async refresh({ state, rootState, commit, dispatch }): Promise<void> {
      await dispatch("init");
      await dispatch("loadIgnore");
      if (state.state === "ready") {
        commit("setGitStatusLoading", true);

        const ig = ignore().add([".git", ...parseIgnore(state.gitignore)]);

        console.time("scan");
        const list = new Set(
          [
            ...(await listFiles({
              dir: (rootState as any).editor.project,
            })),
            ...(
              await scanDir(
                (rootState as any).editor.project,
                ig,
                (rootState as any).editor.project
              )
            ).map((item) => relative((rootState as any).editor.project, item)),
          ]
            .sort()
            .sort((a, b) => {
              return a.split("/").length - b.split("/").length;
            })
        );
        let cache = Object.create(null);

        for (const filepath of list) {
          commit("setGitStatus", {
            filepath,
            status: await status({
              dir: (rootState as any).editor.project,
              filepath,
              cache,
            }),
          });
        }

        console.timeEnd("scan");

        cache = null;
        commit("setGitStatusLoading", false);
      } else {
        commit("clearGitStatus");
      }
    },
  },
};

export default store;
