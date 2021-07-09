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
      
      if ( state.lines.length > 33 ) {
        state.lines.splice( 0, state.lines.length - 33 - 1 )
      }

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
      if ( state.lines.length > 33 ) {
        state.lines.splice( 0, state.lines.length - 33 - 1 )
      }

      state.done = true;
    },
    warning({ lines }, payload) {
      lines.push({
        color: "warning",
        message: payload,
      });
      if ( lines.length > 33 ) {
        lines.splice( 0, lines.length - 33 - 1 )
      }
    },
    success({ lines }, payload) {
      lines.push({
        color: "success",
        message: payload,
      });
      if ( lines.length > 33 ) {
        lines.splice( 0, lines.length - 33 - 1 )
      }
    },
  },
};
