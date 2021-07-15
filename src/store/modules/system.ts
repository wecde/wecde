import { Module } from "vuex";

export interface State {
  navigation: boolean;
  progress: boolean;
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    navigation: false,
    progress: false,
  },

  mutations: {
    setNavigation(state, value: boolean): void {
      state.navigation = value;
    },
    setProgress(state, value: boolean): void {
      state.progress = value;
    },
  },
};

export default store;
