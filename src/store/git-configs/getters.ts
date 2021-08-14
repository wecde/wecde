import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { GitConfigsStateInterface, GitRcItem } from "./state";
import { getHostType } from "./utils";

const getters: GetterTree<GitConfigsStateInterface, StateInterface> = {
  getHostType() {
    return getHostType;
  },
  getConfig(state) {
    return (url: string, prop?: keyof GitRcItem): string | GitRcItem => {
      const host = getHostType(url);
      return prop ? state[host][prop] : state[host];
    };
  },
};

export default getters;
