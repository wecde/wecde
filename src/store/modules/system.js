export default {
  namespaced: true,
  state: {
    navigation: false,
  },

  mutations: {
    setNavigation(state, value) {
      state.navigation = value;
    },
  },
};
