import { Module } from "vuex";

export interface State {
  isShow: boolean;
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    isShow: false,
  },
  mutations: {
    show(state): void {
      state.isShow = true;
    },
    hide(state): void {
      state.isShow = false;
    },
  },
};

export default store;
