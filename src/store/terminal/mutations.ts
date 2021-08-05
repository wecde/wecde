import { MutationTree } from "vuex";

import { TerminalStateInterface } from "./state";

const mutation: MutationTree<TerminalStateInterface> = {
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
    // eslint-disable-next-line functional/immutable-data
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
    // eslint-disable-next-line functional/immutable-data
    lines.push({
      color: "warning",
      message,
    });
    if (lines.length > 33) {
      // eslint-disable-next-line functional/immutable-data
      lines.splice(0, lines.length - 33 - 1);
    }
  },
  success({ lines }, message: string): void {
    // eslint-disable-next-line functional/immutable-data
    lines.push({
      color: "success",
      message,
    });
    if (lines.length > 33) {
      // eslint-disable-next-line functional/immutable-data
      lines.splice(0, lines.length - 33 - 1);
    }
  },
};

export default mutation;
