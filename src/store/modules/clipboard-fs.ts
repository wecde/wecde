import { Module } from "vuex";
import { basename, join, dirname } from "path";
import {
  stat,
  copy as fsCopy,
  rename as fsMove,
  readdir as fsReaddir,
} from "@/modules/filesystem";
import { pathEquals, isParentFolder } from "@/utils";
import Vue from "vue";

async function resolveName(dirname: string, name: string): Promise<string> {
  const names: string[] = await fsReaddir(dirname);

  if (names.includes(name) === false) {
    return name;
  }

  let index = 1;
  let newName: string;

  while (
    names.includes(
      (newName = `${name} copy` + (index === 1 ? "" : ` ${index}`))
    )
  ) {
    index++;
  }

  return newName;
}

export interface State {
  objects: {
    path: string;
    vue: Vue;
  }[];
  action: "cut" | "copy";
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    objects: [],
    action: "copy",
  },
  mutations: {
    cut(
      state,
      uris: {
        path: string;
        vue: Vue;
      }[]
    ): void {
      state.action = "cut";

      state.objects.splice(0);
      state.objects.push(...uris);
    },
    copy(
      state,
      uris: {
        path: string;
        vue: Vue;
      }[]
    ): void {
      state.action = "copy";

      state.objects.splice(0);
      state.objects.push(...uris);
    },
    reset(state): void {
      state.action = "copy";
      state.objects.splice(0);
    },
  },
  getters: {
    has:
      (state) =>
      (uri: string): boolean => {
        return state.objects.some((item) => pathEquals(item.path, uri));
      },
    isEmpty(state): boolean {
      return state.objects.length === 0;
    },
    cutting({ action }): boolean {
      return action === "cut";
    },
    allowPaste(state) {
      return (fullpath: string): boolean => {
        // if this.file.fullpath as children -> exit
        const indexParentFile = state.objects.findIndex((item: any): boolean =>
          isParentFolder(item.path, fullpath)
        );

        if (indexParentFile > -1) {
          return false;
        }

        return true;
      };
    },
  },
  actions: {
    async paste({ commit, state }, uri: string): Promise<boolean> {
      commit("progress/show", undefined, {
        root: true,
      });

      let refreshParent = false;

      if ((await stat(uri)).type === "directory") {
        await Promise.all(
          state.objects.map(async (item) => {
            const from = item.path;
            const to = pathEquals(uri, item.path)
              ? join(
                  dirname(uri),
                  state.action === "copy"
                    ? await resolveName(dirname(uri), basename(item.path))
                    : basename(item.path)
                )
              : join(
                  uri,
                  state.action === "copy"
                    ? await resolveName(uri, basename(item.path))
                    : basename(item.path)
                );

            if (state.action === "copy") {
              await fsCopy(from, to);
            } else {
              await fsMove(from, to);
            }

            if (refreshParent === false && pathEquals(uri, item.path)) {
              refreshParent = true;
            }
          })
        );
      } else {
        throw new Error("Can only paste in one folder");
      }

      if (state.action === "cut") {
        state.objects.forEach((item: any) => {
          item.vue.$emit("removed");
        });
      }

      commit("reset");
      commit("progress/hide", undefined, {
        root: true,
      });

      return refreshParent;
    },
  },
};

export default store;
