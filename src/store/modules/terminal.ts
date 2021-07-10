import { Module } from "vuex";

export interface State {
  lines: {
    color?: string;
    message: string;
  }[];
  done: boolean;
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    lines: [],

    done: false,
  },
  mutations: {
    print(state, message: string): void {
      state.lines.push({
        message,
      });

      if (state.lines.length > 33) {
        state.lines.splice(0, state.lines.length - 33 - 1);
      }

      state.done = false;
    },
    clear({ lines }) {
      lines.splice(0);
    },
    error(state, message: string): void {
      state.lines.push({
        color: "error",
        message,
      });
      if (state.lines.length > 33) {
        state.lines.splice(0, state.lines.length - 33 - 1);
      }

      state.done = true;
    },
    warning({ lines }, message: string): void {
      lines.push({
        color: "warning",
        message,
      });
      if (lines.length > 33) {
        lines.splice(0, lines.length - 33 - 1);
      }
    },
    success({ lines }, message: string): void {
      lines.push({
        color: "success",
        message,
      });
      if (lines.length > 33) {
        lines.splice(0, lines.length - 33 - 1);
      }
    },
  },
};

export default store;
