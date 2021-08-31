import git from "isomorphic-git"
import fs from "modules/fs";
import { configs as gitConfigs, onError, onProgress } from "src/helpers/git";
import { store } from "src/store";

import type { Change } from "./Git.types";

export async function checkout(ref: string, force = false): Promise<boolean> {
  // eslint-disable-next-line functional/no-let
  let result = false;

  if (store.state.editor.project) {
    try {
      await git.checkout({
        fs,
        dir: store.state.editor.project,
        ref,
        force,
        noCheckout: gitConfigs.noCheckout,
        onProgress,
      });

      result = true;
    } catch (err) {
      onError(err);
    }
  }

  return result;
}

export async function getRemoteNow(): Promise<string | void> {
  if (store.state.editor.project) {
    return await git.getConfig({
      fs,
      dir: store.state.editor.project,
      path: "remote.origin.url",
    });
  }
}

export async function add({ status, filepath }: Change): Promise<void> {
  if (store.state.editor.project) {
    if (status === "*deleted") {
      await git.remove({
        fs,
        dir: store.state.editor.project,
        filepath,
      });
    } else if (status === "*added" || status === "*modified") {
      await git.add({
        fs,
        dir: store.state.editor.project,
        filepath,
      });
    }
  }
}

export async function reset({ status, filepath }: Change): Promise<void> {
  if (store.state.editor.project && status.startsWith("*") === false) {
    await git.resetIndex({
      fs,
      dir: store.state.editor.project,
      filepath,
    });
  }
}

export async function resetHard(filepath: string): Promise<void> {
  if (store.state.editor.project) {
    await git.checkout({
      fs,
      dir: store.state.editor.project,
      force: true,
      noUpdateHead: true,
      filepaths: [filepath],
    });
  }
}

export async function commit(
  message: string,
  changes: readonly Change[]
): Promise<boolean> {
  // eslint-disable-next-line functional/no-let
  let result = false;

  if (store.state.editor.project) {
    try {
      await Promise.all(changes.map((item) => add(item)));
      /// commit
      const remoteNow = await getRemoteNow();
      await git.commit({
        fs,
        dir: store.state.editor.project,
        author: {
          email: store.getters["git-configs/getConfig"](
            remoteNow ?? "github.com",
            "email"
          ),
          name: store.getters["git-configs/getConfig"](
            remoteNow ?? "github.com",
            "name"
          ),
        },
        message,
      });

      result = true;
    } catch (err) {
      store.commit("terminal/error", err);
    }
  }

  return result;
}
