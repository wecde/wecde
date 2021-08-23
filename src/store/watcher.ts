import fs from "modules/filesystem";
import { relative } from "path-cross";
import type { Store } from "vuex";

import type { StateInterface } from "./index";

export default (store: Store<StateInterface>): void => {
  // * for project
  fs.on("move:dir", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isEqual(from, store.state.editor.project)
    ) {
      store.commit("editor/setProject", to);
    }
  });

  // * for sessions
  fs.on("move:file", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, from)
    ) {
      store.state.editor.sessions.forEach((item: string, index: number) => {
        if (fs.isEqual(from, item)) {
          store.commit("editor/updateSession", {
            index,
            value: to,
          });
        }
      });
    }
  });

  fs.on("move:dir", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, from)
    ) {
      store.state.editor.sessions.forEach((item: string, index: number) => {
        if (fs.isParentDir(from, item)) {
          store.commit("editor/updateSession", {
            index,
            value: fs.replaceParentDir(item, from, to),
          });
        }
      });
    }
  });

  fs.on("remove:file", (path) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path)
    ) {
      store.state.editor.sessions.forEach((item: string, index: number) => {
        if (fs.isEqual(path, item)) {
          store.commit("editor/removeSession", index);
        }
      });
    }
  });

  fs.on("remove:dir", (path) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path)
    ) {
      store.state.editor.sessions.forEach((item: string, index: number) => {
        if (fs.isParentDir(path, item)) {
          store.commit("editor/removeSession", index);
        }
      });
    }
  });
  // *

  // * for scrollEnhance
  fs.on("move:file", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, from)
    ) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const file in store.state.editor.scrollEnhance) {
        if (fs.isEqual(from, file)) {
          store.commit("editor/updateFileScrollEnhance", {
            file,
            newFile: to,
          });
        }
      }
    }
  });
  fs.on("move:dir", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, from)
    ) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const file in store.state.editor.scrollEnhance) {
        if (fs.isParentDir(from, file)) {
          store.commit("editor/updateFileScrollEnhance", {
            file,
            newFile: fs.replaceParentDir(file, from, to),
          });
        }
      }
    }
  });
  fs.on("remove:file", (path) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path)
    ) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const file in store.state.editor.scrollEnhance) {
        if (fs.isEqual(path, file)) {
          store.commit("editor/removeScrollEnhance", file);
        }
      }
    }
  });
  fs.on("remove:dir", (path) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path)
    ) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const file in store.state.editor.scrollEnhance) {
        if (fs.isParentDir(path, file)) {
          store.commit("editor/removeScrollEnhance", file);
        }
      }
    }
  });
  // *

  // * update .gitignore
  fs.watch("projects/*/.gitignore", ({ path }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path as string)
    ) {
      void store.dispatch("git-project/loadIgnore");
    }
  });
  // *

  // * watch .git/index
  fs.watch("projects/*/.git/index", ({ path }) => {
    if (
      store.state.editor.project &&
      fs.isParentDir(store.state.editor.project, path as string)
    ) {
      void store.dispatch("git-project/checkDotGit");
    }
  });
  // *

  // * watch editor.project
  store.watch(
    () => store.state.editor.project,
    (value) => {
      if (value) {
        void store.dispatch("git-project/refresh");
      }
    },
    {
      immediate: true,
    }
  );
  // *

  // * watch ** files from projects
  fs.watch(
    "projects/*/**",
    ({ path }) => {
      if (
        store.state.editor.project &&
        (fs.isParentDir(store.state.editor.project, path as string) ||
          fs.isEqual(store.state.editor.project, path as string))
      ) {
        void store.dispatch("git-project/updateMatrix", [
          relative(store.state.editor.project, path as string),
        ]);
      }
    },
    {
      type: "file",
    }
  );
  fs.watch(
    "projects/*/**",
    ({ path }) => {
      if (
        store.state.editor.project &&
        (fs.isParentDir(store.state.editor.project, path as string) ||
          fs.isEqual(store.state.editor.project, path as string))
      ) {
        void store.dispatch("git-project/updateMatrix", [
          relative(store.state.editor.project, path as string),
        ]);
      }
    },
    {
      type: "dir",
    }
  );
  // *
};
