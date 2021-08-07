import { isParentFolder, pathEquals } from "src/utils";
import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { ClipboardFStateInterface } from "./state";

const getters: GetterTree<ClipboardFStateInterface, StateInterface> = {
  has:
    (state) =>
    (uri: string): boolean => {
      return state.objects.some((item) => pathEquals(item.path, uri));
    },
  isEmpty(state): boolean {
    return state.objects.length === 0;
  },
  cutting({ action }): boolean {
    return action === "cut";
  },
  allowPaste(state) {
    return (fullpath: string): boolean => {
      // if this.file.fullpath as children -> exit
      const indexParentFile = state.objects.findIndex((item) => {
        return isParentFolder(item.path, fullpath);
      });

      if (indexParentFile === -1) {
        return true;
      }

      return false;
    };
  },
};

export default getters;
