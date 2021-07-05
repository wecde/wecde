export default {
  namespaced: true,
  state: {
    lines: [],
  },
  mutations: {
    print({ lines }, payload) {
      lines.push(payload);
    },
    clear({ lines }) {
      lines.splice(0);
    },
  },
};
