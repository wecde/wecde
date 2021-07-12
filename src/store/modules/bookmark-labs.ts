import { Module } from "vuex";
import type { Template } from "@/assets/labs/Release.json";

export interface State {
  labs: Template[];
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    labs: [],
  },

  mutations: {
    toggle(state, lab: Template): void {
      if (state.labs.findIndex((item) => item.name === lab.name) > -1) {
        state.labs = state.labs.filter((item) => item.name !== lab.name);
      } else {
        state.labs.push(lab);
      }
    },
  },
};

export default store;
