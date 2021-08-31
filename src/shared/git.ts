import git, { resolveRef } from "isomorphic-git";
import { reset as _reset } from "isomorphic-git-addons";
import fs from "modules/fs";
import { join } from "path-cross";
import { configs } from "src/helpers/git";
import { store } from "src/store";

export async function reset(
  filepath: string,
  staged: boolean | null,
  isFolder = false
): Promise<void> {
  if (store.state.editor.project) {
    if (isFolder) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const [filepath, matrix] of Object.entries(
        store.state.editor.git.statusMatrix.matrix
      )) {
        if (
          matrix.join("").startsWith("11") === false &&
          (staged == null || (staged ? matrix[2] === 2 : matrix[2] !== 2))
        ) {
          await reset(filepath, staged);
        }
      }
    } else {
      void _reset({
        fs,
        dir: store.state.editor.project,
        filepath,
        oid: await resolveRef({
          fs,
          dir: store.state.editor.project,
          ref: "HEAD",
        }),
      });
    }
  }
}
export async function resetIndex(
  filepath: string,
  isFolder = false
): Promise<void> {
  if (store.state.editor.project) {
    if (isFolder) {
      await Promise.all(
        Object.entries(store.state.editor.git.statusMatrix.matrix)
          .filter(([_filepath]) => _filepath.startsWith(filepath))
          .map(async ([filepath, matrix]) => {
            if (matrix.join("") !== "111") {
              await git.resetIndex({
                fs,
                dir: store.state.editor.project as string,
                filepath,
              });
            }
          })
      );
    } else {
      await git.resetIndex({
        fs,
        dir: store.state.editor.project,
        filepath,
      });
    }

    void store.dispatch("editor/update:matrix-of-filepath", filepath);
  }
}
export async function add(filepath: string, isFolder = false): Promise<void> {
  if (store.state.editor.project) {
    if (isFolder) {
      await Promise.all(
        Object.entries(store.state.editor.git.statusMatrix.matrix)
          .filter(([_filepath]) => _filepath.startsWith(filepath))
          .map(async ([filepath, matrix]) => {
            if (matrix.join("") !== "111") {
              if (matrix[0] === 1 && matrix[1] === 0) {
                // deleted
                await git.remove({
                  fs,
                  dir: store.state.editor.project as string,
                  filepath,
                });
              } else {
                await git.add({
                  fs,
                  dir: store.state.editor.project as string,
                  filepath,
                });
              }
            }
          })
      );
    } else {
      const status = store.getters["editor/status:filepath"](
        join(store.state.editor.project, filepath),
        isFolder
      );
      if (status.startsWith("10")) {
        await git.remove({
          fs,
          dir: store.state.editor.project,
          filepath,
        });
      } else {
        await git.add({
          fs,
          dir: store.state.editor.project,
          filepath,
        });
      }
    }

    void store.dispatch("editor/update:matrix-of-filepath", filepath);
  }
}
export async function commitAll(message: string): Promise<void> {
  if (store.state.editor.project) {
    await add("", true);
    await git.commit({
      fs,
      dir: store.state.editor.project,
      message,
      author: configs.authorFor(
        (await git.getConfig({
          fs,
          dir: store.state.editor.project,
          path: "remote.origin.url",
        })) || "https://github.com/"
      ),
    });
  }
}
