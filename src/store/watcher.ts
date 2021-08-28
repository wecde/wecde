import fs from "modules/fs";
import { join, relative } from "path-cross";
import {
  getMetadataStatusMatrix,
  patchMetadataStatusMatrix,
} from "src/helpers/metadata";
import { createTimeoutBy } from "src/utils";
import { getFilepathFrom, getPathToProjectFrom } from "src/utils/metadata";
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

  function updateEditorDotGit(fullpath: string | null): void {
    createTimeoutBy(
      "update git if editor.project change",
      async () => {
        store.commit("editor/set:git", "unknown");

        if (fullpath && (await fs.isFile(join(fullpath, ".git/index")))) {
          store.commit("editor/set:git", "ready");
        } else {
          store.commit("editor/set:git", "unready");
        }
      },
      1
    );
  }
  // * watch change editor.project -> update editor.git
  store.watch(() => store.state.editor.project, updateEditorDotGit, {
    immediate: true,
  });
  // *

  // * watch change projects/*/.git/index -> update editor.git
  fs.watch(
    "projects/*/.git/index",
    ({ path }) => updateEditorDotGit(path ?? null),
    {
      miniOpts: {
        dot: true,
      },
    }
  );
  // *

  function updateEditorDotGitMatrix(fullpath: string | null): void {
    createTimeoutBy(
      "read file status-matrix.json",
      async () => {
        if (fullpath) {
          store.commit("editor/set:gitMatrixLoading", true);
          const rawStatusMatrix = await getMetadataStatusMatrix(fullpath);
          store.commit("editor/set:gitMatrix", rawStatusMatrix || {});
          store.commit("editor/set:gitMatrixLoading", false);
          console.log("update store");
        }
      },
      1
    );
  }
  // * watch change editor.project -> update editor.gitMatrix
  store.watch(() => store.state.editor.project, updateEditorDotGitMatrix, {
    immediate: true,
  });
  // *

  // * watch file status-matrix.json change -> update editor.gitMatrix
  fs.watch(
    ".metadata/*/status-matrix.json",
    ({ path }) => {
      if (
        store.state.editor.project &&
        path &&
        fs.isParentDir(
          store.state.editor.project,
          join("projects", relative(".metadata", path))
        )
      ) {
        /// ok
        void updateEditorDotGitMatrix(
          join("projects", relative(".metadata", path))
        );
      }
    },
    {
      miniOpts: {
        dot: true,
      },
    }
  );
  // *

  // * watch file and folder change -> update .metadata/*/status-matrix.json
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fs.watch("projects/*/**", async ({ path }) => {
    console.log(path);
    if (path) {
      store.commit("editor/set:gitMatrixLoading", true);
      /// update now;
      await patchMetadataStatusMatrix(path, [
        getFilepathFrom(getPathToProjectFrom(path), path),
      ]);
      store.commit("editor/set:gitMatrixLoading", false);
    }
  }, 
  {
    miniOpts: {
      dot: true
    }
  });
  // *
};
