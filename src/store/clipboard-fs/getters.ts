import fs from "modules/fs";
import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { ClipboardFStateInterface } from "./state";

const getters: GetterTree<ClipboardFStateInterface, StateInterface> = {
  has:
    (state) =>
    (uri: string): boolean =>
      state.clipboardFile !== null && fs.isEqual(state.clipboardFile, uri),
  isEmpty(state): boolean {
    return state.clipboardFile === null;
  },
  cutting({ action }): boolean {
    return action === "cut";
  },
  allowPaste(state) {
    return (fullpath: string): boolean => {
      return (
        state.clipboardFile !== null &&
        fs.isParentDir(state.clipboardFile, fullpath) !== true
      );
    };
  },
};

export default getters;
