import { Module } from "vuex";

export interface State {
  navigation: boolean;
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    navigation: false,
  },

  mutations: {
    setNavigation(state, value: boolean): void {
      state.navigation = value;
    },
  },
};

export default store;
