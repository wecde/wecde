export default {
  namespaced: true,
  state: {
    lines: [],

    done: false,
  },
  mutations: {
    print(state, payload) {
      state.lines.push({
        message: payload,
      });

      state.done = false;
    },
    clear({ lines }) {
      lines.splice(0);
    },
    error(state, payload) {
      state.lines.push({
        color: "error",
        message: payload.message,
      });

      state.done = true;
    },
    warning({ lines }, payload) {
      lines.push({
        color: "warning",
        message: payload,
      });
    },
    success({ lines }, payload) {
      lines.push({
        color: "success",
        message: payload,
      });
    },
    replace({ lines }, payload) {
      lines.splice(lines.length - 1, 1, {
        message: payload,
      });
    },
  },
};
