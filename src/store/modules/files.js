export default {
  namespaced: true,

  state: {
    project: null,
  },
  mutations: {
    setProject(state, value) {
      state.project = value;
    },
  },
};
