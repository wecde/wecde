import git from "isomorphic-git";
import fs from "modules/fs";
import { configs } from "src/helpers/git";
import { store } from "src/store";

export async function reset(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await git.checkout({
      fs,
      dir: store.state.editor.project,
      filepaths: filepaths.slice(0),
      ref: "HEAD",
    });
  }
}
export async function resetIndex(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await Promise.all(
      Object.entries(store.state.editor.git.statusMatrix.matrix)
        .filter(([_filepath]) => filepaths.includes(_filepath))
        .map(async ([filepath, matrix]) => {
          if (matrix.join("") !== "111") {
            await git.resetIndex({
              fs,
              dir: store.state.editor.project as string,
              filepath,
            });

            void store.dispatch("editor/update:matrix-of-filepath", filepath);
          }
        })
    );
  }
}
export async function add(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await Promise.all(
      Object.entries(store.state.editor.git.statusMatrix.matrix)
        .filter(([_filepath]) => filepaths.includes(_filepath))
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

            void store.dispatch("editor/update:matrix-of-filepath", filepath);
          }
        })
    );
  }
}
export async function commitAll(message: string): Promise<void> {
  if (store.state.editor.project) {
    await add(Object.keys(store.state.editor.git.statusMatrix.matrix));
    await commit(message);
  }
}
export async function commit(message: string): Promise<void> {
  if (store.state.editor.project) {
    const author = configs.authorFor(
      (await git.getConfig({
        fs,
        dir: store.state.editor.project,
        path: "remote.origin.url",
      })) || "https://github.com/"
    );

    const oid = await git.commit({
      fs,
      dir: store.state.editor.project,
      author,
      message,
    });

    console.info(`Committed ${oid}`);
  }
}
