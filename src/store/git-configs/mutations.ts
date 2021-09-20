import { MutationTree } from "vuex";

import { GitConfigsStateInterface, GitRcItem, HostType } from "./state";

const mutation: MutationTree<GitConfigsStateInterface> = {
  "set:viewAs"(state, value: GitConfigsStateInterface["viewAs"]): void {
    state.viewAs = value;
  },
  "set:sortBy"(state, value: GitConfigsStateInterface["sortBy"]): void {
    state.sortBy = value;
  },

  setConfig(
    state,
    {
      host,
      prop,
      value,
    }: {
      readonly host: HostType;
      readonly prop: keyof GitRcItem;
      readonly value: string;
    }
  ) {
    state[host] = {
      ...state[host],
      [prop]: value,
    };
  },
};

export default mutation;
