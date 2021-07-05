export default {
  namespaced: true,
  state: {
    store: Object.create(null),
  },

  mutations: {
    setStore(state, { file, value }) {
      state.store = {
        ...state.store,
        [file]: value,
      };
    },
  },
};
