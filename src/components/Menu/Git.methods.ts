import { proxy } from "comlink";
import { configs as gitConfigs, onError, onProgress } from "src/helpers/git";
import { store } from "src/store";
import gitWorker from "src/worker/git";

import type { Change } from "./Git.types";

export async function checkout(ref: string, force = false): Promise<boolean> {
  // eslint-disable-next-line functional/no-let
  let result = false;

  store.commit("system/setProgress", true);
  if (store.state.editor.project) {
    try {
      await gitWorker.checkout(
        {
          dir: store.state.editor.project,
          ref,
          force,
          noCheckout: gitConfigs.noCheckout,
        },
        proxy(onProgress)
      );

      result = true;
    } catch (err) {
      onError(err);
    }
  }
  store.commit("system/setProgress", false);

  return result;
}

export async function getRemoteNow(): Promise<string | void> {
  if (store.state.editor.project) {
    return await gitWorker.getConfig({
      dir: store.state.editor.project,
      path: "remote.origin.url",
    });
  }
}

export async function add({ status, filepath }: Change): Promise<void> {
  if (store.state.editor.project) {
    if (status === "*deleted") {
      await gitWorker.remove({
        dir: store.state.editor.project,
        filepath,
      });
    } else if (status === "*added" || status === "*modified") {
      await gitWorker.add({
        dir: store.state.editor.project,
        filepath,
      });
    }
  }
}

export async function reset({ status, filepath }: Change): Promise<void> {
  if (store.state.editor.project && status.startsWith("*") === false) {
    await gitWorker.resetIndex({
      dir: store.state.editor.project,
      filepath,
    });
  }
}

export async function resetHard(filepath: string): Promise<void> {
  if (store.state.editor.project) {
    await gitWorker.checkout({
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
  store.commit("system/setProgress", true);
  if (store.state.editor.project) {
    try {
      await Promise.all(changes.map((item) => add(item)));
      /// commit
      const remoteNow = await getRemoteNow();
      await gitWorker.commit({
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
  store.commit("system/setProgress", false);

  return result;
}
