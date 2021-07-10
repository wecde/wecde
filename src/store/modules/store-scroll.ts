import { Module } from "vuex";

export interface State {
  store: {
    [fullpath: string]: {
      x: number;
      y: number;
    };
  };
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    store: Object.create(null),
  },

  mutations: {
    setStore(
      state,
      {
        file,
        value,
      }: {
        file: string;
        value: {
          x: number;
          y: number;
        };
      }
    ): void {
      state.store = {
        ...state.store,
        [file]: value,
      };
    },
  },
};

export default store;
