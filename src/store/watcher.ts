import minimatch from "minimatch";
import fs from "modules/fs";
import { basename, join } from "path-cross";
import type { Store } from "vuex";

import type { StateInterface } from "./index";

export default (store: Store<StateInterface>): void => {
  // * for project
  fs.on("move:dir", ({ from, to }) => {
    if (
      store.state.editor.project &&
      fs.isEqual(from, store.state.editor.project)
    ) {
      store.commit("editor/set:project", to);
    }
  });
  // *

  // * rename .metadata/* if rename project
  fs.on("move:dir", ({ from, to }) => {
    if (
      minimatch(from, "projects/*", {
        dot: true,
      })
    ) {
      try {
        void fs.rename(
          join(".metadata", basename(from)),
          join(".metadata", basename(to))
        );
      } catch {}
    }
  });
  // *

  // * remove .metadata/* if remove project
  fs.on("remove:dir", (fullpath) => {
    if (
      minimatch(fullpath, "projects/*", {
        dot: true,
      })
    ) {
      try {
        void fs.unlink(join(".metadata", basename(fullpath)), {
          removeAll: true,
        });
      } catch {}
    }
  });
  // *

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

  // ------------------------------------------------

  // * watch change editor.project -> update editor.git.statusMatrix
  store.watch(
    () => store.state.editor.project,
    () => {
      store.commit("editor/filter:git.statusMatrix.matrix", () => false);
      void store.dispatch("editor/update:matrix-of-filepath");
    },
    {
      immediate: true,
    }
  );
  // *

  // * watch file and folder change -> update editor.git.statusMatrix
  fs.watch(
    "projects/*/**",
    ({ path }) => {
      if (store.state.editor.project) {
        const gitdir = join(store.state.editor.project, ".git");
        if (
          fs.isEqual(gitdir, path) === false &&
          fs.isParentDir(gitdir, path) === false
        ) {
          // bypass .git. Example: projects/fcanvas/{.git}/index

          void store.dispatch("editor/update:matrix-of-filepath", [
            fs.relative(store.state.editor.project, path),
          ]);
        }
      }
    },
    {
      miniOpts: {
        dot: true,
      },
      dir: () => store.state.editor.project,
    }
  );
  // *

  // * if .gitignore change -> update editor.git.statusMatrix
  fs.watch(
    "projects/*/.gitignore",
    () => void store.dispatch("editor/update:matrix-of-filepath"),
    {
      type: "file",
      dir: () => store.state.editor.project,
    }
  );
  // *

   // * watch change ref
  fs.watch(
    "projects/*/.git/HEAD",
    () => void store.dispatch("editor/update:matrix-of-filepath"),
    {
      type: "file",
      dir: () => store.state.editor.project,
    }
  );
  // *

  // // * watch status file change by .add(), resetIndex(), pull(), -> .git/index -> update editor.git.statusMatrix
  // fs.watch(
  //   "projects/*/.git/index",
  //   () => update_state_editor_git_statusMatrix(null),
  //   {
  //     type: "file",
  //     dir: () => store.state.editor.project,
  //   }
  // );
  // // *
};
