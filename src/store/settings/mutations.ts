import { MutationTree } from "vuex";

import { SettingsStateInterface } from "./state";

const mutation: MutationTree<SettingsStateInterface> = {
  "set:<T>"(
    state,
    {
      propName,
      value,
    }: {
      readonly propName: string;
      readonly value: unknown;
    }
  ): void {
    state[propName] = value;
  },
};

export default mutation;
