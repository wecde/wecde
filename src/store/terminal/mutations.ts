import { MutationTree } from "vuex";

import { TerminalStateInterface } from "./state";

const mutation: MutationTree<TerminalStateInterface> = {
  print(
    state,
    message:
      | string
      | {
          readonly message: string;
          readonly color?: string;
        }
  ): void {
    if (typeof message === "string") {
      message = {
        message,
      };
    }
    state.lines.push({
      color: message.color,
      message: message.message.replace(/^"|"$/g, ""),
    });

    if (state.lines.length > 33) {
      state.lines.splice(0, state.lines.length - 33 - 1);
    }
  },
  clear({ lines }) {
    // eslint-disable-next-line functional/immutable-data
    lines.splice(0);
  },
  error(state, message: string | Error): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("terminal/print", {
      message: message instanceof Error ? `${message.message}` : message,
      color: "red",
    });
    console.error(message);
  },
  warning(state, message: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("terminal/print", {
      message,
      color: "yellow",
    });
  },
  success(state, message: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("terminal/print", {
      message,
      color: "green",
    });
  },
  info(state, message: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("terminal/print", {
      message,
      color: "blue",
    });
  },
};

export default mutation;
