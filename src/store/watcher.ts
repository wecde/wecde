import minimatch from "minimatch";
import fs from "modules/fs";
import { basename, join } from "path-cross";
import { statusMatrix, worthWalking } from "src/helpers/git";
import { createTimeoutBy } from "src/utils";
import type { Store } from "vuex";

import { EditorStateInterface } from "./editor/state";

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

  function update_state_editor_git_status(): void {
    createTimeoutBy(
      "update git if editor.project change",
      async () => {
        const dir = store.state.editor.project;
        store.commit("editor/set:git.status", "unknown");

        if (dir && (await fs.isFile(join(dir, ".git/index")))) {
          store.commit("editor/set:git.status", "ready");
        } else {
          store.commit("editor/set:git.status", "unready");
        }
      },
      1
    );
  }
  // * watch change editor.project -> update editor.git.status
  store.watch(
    () => store.state.editor.project,
    () => void update_state_editor_git_status(),
    {
      immediate: true,
    }
  );
  // *

  // * watch change projects/*/.git/index -> update editor.git.status
  fs.watch("projects/*/.git/index", () => update_state_editor_git_status(), {
    miniOpts: {
      dot: true,
    },
    type: "file",
    dir: () => store.state.editor.project,
  });
  // *

  function update_state_editor_git_statusMatrix(fullpath: string | null): void {
    createTimeoutBy(
      "update status matrix",
      async () => {
        if (
          store.state.editor.project &&
          (await fs.isFile(join(store.state.editor.project, ".git/index")))
        ) {
          const filepaths = [
            fullpath ? fs.relative(store.state.editor.project, fullpath) : ".",
          ];

          store.commit("editor/set:git.statusMatrix.loading", true);

          const matrix = (
            await statusMatrix({
              fs,
              dir: store.state.editor.project,
              filepaths,
            })
          ).reduce((obj, [filepath, ...value]) => {
            // eslint-disable-next-line functional/immutable-data
            obj[filepath] = value;
            return obj;
          }, {} as EditorStateInterface["git"]["statusMatrix"]["matrix"]);

          console.log(fullpath, matrix);

          store.commit(
            "editor/filter:git.statusMatrix.matrix",
            (filepath: string) =>
              !filepaths.some((base) => worthWalking(filepath, base))
          );
          store.commit("editor/assign:git.statusMatrix.matrix", matrix);

          store.commit("editor/set:git.statusMatrix.loading", false);
        }
      },
      1
    );
  }
  // * watch change editor.project -> update editor.git.statusMatrix
  store.watch(
    () => store.state.editor.project,
    () => {
      store.commit("editor/filter:git.statusMatrix.matrix", () => false);
      update_state_editor_git_statusMatrix(null);
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
      const gitdir = join(store.state.editor.project as string, ".git");
      if (
        fs.isEqual(gitdir, path) === false &&
        fs.isParentDir(gitdir, path) === false
      ) {
        // bypass .git. Example: projects/fcanvas/{.git}/index
        void update_state_editor_git_statusMatrix(path);
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
    () => update_state_editor_git_statusMatrix(null),
    {
      type: "file",
      dir: () => store.state.editor.project,
    }
  );
  // *
};
