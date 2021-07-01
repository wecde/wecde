export default {
  namespaced: true,
  state: {
    file: null,
  },
  mutations: {
    setFile(state, path) {
      state.file = path;
    },
  },
};
