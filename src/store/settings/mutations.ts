import { MutationTree } from "vuex";

import { SettingsStateInterface } from "./state";

const mutation: MutationTree<SettingsStateInterface> = {
  set(
    state,
    {
      path,
      value,
    }: {
      readonly path: string;
      readonly value: unknown
    }
  ): void {
    const breadcrumbs = path.split("->");

    breadcrumbs.slice(0, breadcrumbs.length - 1).forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state = state[item] as any;
    });

    if (typeof state === "object") {
      state[breadcrumbs[breadcrumbs.length - 1]] = value;
    } else {
      console.error(`Store: Can't set "${path}"`);
    }
  },
};

export default mutation;
