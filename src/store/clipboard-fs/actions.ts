import fs from "modules/fs";
import { basename, dirname, join } from "path-cross";
import { Notify } from "quasar";
import { ActionTree } from "vuex";

import type { StateInterface } from "../index";

import { ClipboardFStateInterface } from "./state";

async function resolveName(dirname: string, name: string): Promise<string> {
  const names: readonly string[] = await fs.readdir(dirname);

  if (names.includes(name) === false) {
    return name;
  }

  // eslint-disable-next-line functional/no-let
  let index = 1,
    newName: string;

  // eslint-disable-next-line functional/no-loop-statement
  while (
    names.includes(
      (newName = `${name} copy` + (index === 1 ? "" : ` ${index}`))
    )
  ) {
    index++;
  }

  return newName;
}

const actions: ActionTree<ClipboardFStateInterface, StateInterface> = {
  /**
   * @description true if required refresh this component parent
   */
  async paste({ state, getters, commit }, uri: string): Promise<boolean> {
    // eslint-disable-next-line functional/no-let
    let refreshParent = false;

    if (state.clipboardFile && (await fs.exists(uri))) {
      if ((await fs.stat(uri)).isFile()) {
        uri = dirname(uri);
      }

      if (getters.allowPaste(uri)) {
        const from = state.clipboardFile;
        const to: string = fs.isEqual(uri, state.clipboardFile)
          ? join(
              dirname(uri),
              state.action === "copy"
                ? await resolveName(dirname(uri), basename(state.clipboardFile))
                : basename(state.clipboardFile)
            )
          : join(
              uri,
              state.action === "copy"
                ? await resolveName(uri, basename(state.clipboardFile))
                : basename(state.clipboardFile)
            );

        const task = Notify.create({
          spinner: true,
          timeout: 9999999999,
          position: "bottom-right",
          message: `${state.action} "${from}" to "${to}"`,
        });

        if (state.action === "copy") {
          await fs.copy(from, to);
        } else {
          await fs.rename(from, to);
        }

        task();

        if (refreshParent === false && fs.isEqual(uri, state.clipboardFile)) {
          refreshParent = true;
        }
      } else {
        console.warn(
          `Cannot copy parent directory to its own subdirectory "${state.clipboardFile}" -> "${uri}"`
        );
      }

      commit("done");
    }

    return refreshParent;
  },
};

export default actions;
