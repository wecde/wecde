import git from "isomorphic-git";
import { fs } from "modules/filesystem";
import { configs as gitConfigs, onError } from "src/helpers/git";
import { store } from "src/store";

export async function checkout(
  ref: string,
  force = false
): Promise<boolean> {
  store.commit("system/setProgress", true);
  if (store.state.editor.project) {
    try {
      await git.checkout({
        fs,
        dir: store.state.editor.project,
        ref,
        force,
        noCheckout: gitConfigs.noCheckout,
      });

      return true;
    } catch (err) {
      onError(err);
    }
  }
  store.commit("system/setProgress", false);

  return false;
}
