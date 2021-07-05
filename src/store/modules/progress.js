export default {
  namespaced: true,
  state: {
    isShow: false,
  },
  mutations: {
    show(state) {
      state.isShow = true;
    },
    hide(state) {
      state.isShow = false;
    },
  },
};
