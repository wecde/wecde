import fs from "modules/fs";
import { join } from "path-cross";
import { createTimeoutBy } from "src/utils";
import { useGitWorker } from "src/worker/git";
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

  function update_state_editor_git_status(fullpath: string | null): void {
    createTimeoutBy(
      "update git if editor.project change",
      async () => {
        store.commit("editor/set:git.status", "unknown");

        if (fullpath && (await fs.isFile(join(fullpath, ".git/index")))) {
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
    update_state_editor_git_status,
    {
      immediate: true,
    }
  );
  // *

  // * watch change projects/*/.git/index -> update editor.git.status
  fs.watch(
    "projects/*/.git/index",
    ({ path }) => update_state_editor_git_status(path ?? null),
    {
      miniOpts: {
        dot: true,
      },
    }
  );
  // *

  function update_state_editor_git_statusMatrix(fullpath: string | null): void {
    createTimeoutBy(
      "update status matrix",
      async () => {
        if (store.state.editor.project) {
          store.commit("editor/set:git.statusMatrix.loading", true);

          const matrix = (
            await useGitWorker().statusMatrix({
              fs,
              dir: store.state.editor.project,
              filepaths: [fullpath || "."],
            })
          ).reduce((obj, [filepath, ...value]) => {
            // eslint-disable-next-line functional/immutable-data
            obj[filepath] = value;
            return obj;
          }, {} as EditorStateInterface["git"]["statusMatrix"]["matrix"]);

          console.log(matrix);

          store.commit("editor/set:git.statusMatrix.matrix", matrix);

          store.commit("editor/set:git.statusMatrix.loading", false);
        }
      },
      1
    );
  }
  // * watch change editor.project -> update editor.git.statusMatrix
  store.watch(
    () => store.state.editor.project,
    () => update_state_editor_git_statusMatrix(null),
    {
      immediate: true,
    }
  );
  // *

  // * watch file and folder change -> update editor.git.statusMatrix
  fs.watch(
    "projects/*/**",
    ({ path }) => {
      if (path) {
        void update_state_editor_git_statusMatrix(path);
      }
    },
    {
      miniOpts: {
        dot: true,
      },
    }
  );
  // *
};
