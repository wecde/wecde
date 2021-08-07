import type { Template } from "assets/labs/Release.json";
import { MutationTree } from "vuex";

import { BookmarkLabsStateInterface } from "./state";

const mutation: MutationTree<BookmarkLabsStateInterface> = {
  toggle(state, lab: Template): void {
    if (state.labs.findIndex((item) => item.name === lab.name) > -1) {
      state.labs = state.labs.filter((item) => item.name !== lab.name);
    } else {
      state.labs.push(lab);
    }
  },
};

export default mutation;
