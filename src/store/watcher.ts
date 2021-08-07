import { relative } from "path-cross";
import type { Store } from "vuex";

import eventBus from "../modules/event-bus";
import {
  createTimeoutBy,
  isParentFolder,
  pathEquals,
  pathEqualsOrParent,
} from "../utils";

import type { StateInterface } from "./index";

export default (store: Store<StateInterface>): void => {
  eventBus.on(["move:file", "move:dir"], (to, from) => {
    /// update project

    if (
      store.state.editor.project &&
      (isParentFolder(from, store.state.editor.project) ||
        pathEquals(from, store.state.editor.project))
    ) {
      store.commit(
        "editor/setProject",
        store.state.editor.project.replace(from, to)
      );
    }
    /// update sessions
    store.state.editor.sessions.forEach((item: string, index: number): void => {
      if (isParentFolder(from, item) || pathEquals(from, item)) {
        /// update
        store.commit("editor/updateSession", {
          index,
          value: item.replace(from, to),
        });
      }
    });
    /// update store scroll
    // eslint-disable-next-line functional/no-loop-statement
    for (const file in store.state.editor.scrollEnhance) {
      if (isParentFolder(from, file) || pathEquals(from, file)) {
        store.commit("editor/updateFileScrollEnhance", {
          file,
          newFile: file.replace(from, to),
        });
      }
    }
  });

  store.watch(
    () => store.state.editor.project,
    () => {
      void store.dispatch("git-project/refresh");
    },
    {
      immediate: true,
    }
  );

  eventBus.on(["write:file", "remove:file"], (fullpath) => {
    createTimeoutBy(
      "store watch .gitignore",
      () => {
        if (
          store.state.editor.project &&
          isParentFolder(store.state.editor.project, fullpath)
        ) {
          void store.dispatch("git-project/loadIgnore");
        }
      },
      5000
    );
  });
  eventBus.on(["move:file"], (to, fullpath) => {
    createTimeoutBy(
      "store watch .gitignore",
      () => {
        if (
          store.state.editor.project &&
          isParentFolder(store.state.editor.project, fullpath)
        ) {
          void store.dispatch("git-project/loadIgnore");
        }
      },
      5000
    );
  });

  eventBus.on(
    [
      "create:file",
      "create:dir",

      "remove:file",
      "remove:dir",

      "write:file",

      "move:file",
      "move:dir",

      "copy:file",
      "copy:dir",
    ],
    (fullpath) => {
      createTimeoutBy(
        "store watch .git",
        () => {
          if (
            store.state.editor.project &&
            isParentFolder(store.state.editor.project, fullpath)
          ) {
            const pathRelative = relative(store.state.editor.project, fullpath);

            if (pathEqualsOrParent(pathRelative, ".git")) {
              /// refresh git
              void store.dispatch("git-project/checkDotGit");
            }
          }
        },
        5000
      );
    }
  );
};
