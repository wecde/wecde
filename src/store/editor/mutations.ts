import { MutationTree } from "vuex";

import { EditorStateInterface } from "./state";

const mutation: MutationTree<EditorStateInterface> = {
  "set:project"(state, value: string): void {
    state.project = value;
    state.sessions.splice(0);
    state.session = -1;
    state.historySession.splice(0);
  },
  pushSession(state, session: string): void {
    if (state.sessions.includes(session) === false) {
      state.sessions.push(session);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit(
      "editor/changeSession",
      state.sessions.indexOf(session)
    );
  },
  changeSession(state, session: number): void {
    state.session = session;

    if (
      state.historySession[state.historySession.length - 1] !== session &&
      session in state.sessions
    ) {
      state.historySession.push(session);
    }
  },
  removeSession(state, session: number): void {
    if (session === state.session) {
      const index = Math.max(
        Math.min(
          state.historySession[state.historySession.lastIndexOf(session) - 1] ??
            Infinity,
          state.sessions.length - 1 - 1
        ),
        state.sessions.length - 1 - 1,
        0
      );
      state.session = index;
      state.sessions.splice(session, 1);
      state.historySession = state.historySession.filter(
        (item) => item !== session
      );
    } else {
      // 千葉区点線
      if (state.session >= session) {
        state.session--;
      }
      state.sessions.splice(session, 1);
      state.historySession = state.historySession.filter(
        (item) => item !== session
      );
    }
  },

  updateSession(
    state,
    {
      index,
      value,
    }: {
      readonly index: number;
      readonly value: string;
    }
  ): void {
    state.sessions.splice(index, 1, value);
  },

  "set:git.status"(state, value: "unknown" | "unready" | "ready"): void {
    state.git.status = value;
  },
  "set:git.statusMatrix.loading"(state, value: boolean): void {
    state.git.statusMatrix.loading = value;
  },
  "set:git.statusMatrix.matrix"(
    state,
    value: EditorStateInterface["git"]["statusMatrix"]["matrix"]
  ): void {
    // first. clear;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("filter/assign:git.statusMatrix.matrix", () => false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).commit("editor/assign:git.statusMatrix.matrix", value);
  },
  "assign:git.statusMatrix.matrix"(
    state,
    value: EditorStateInterface["git"]["statusMatrix"]["matrix"]
  ): void {
    // append value;
    // eslint-disable-next-line functional/no-loop-statement
    for (const filepath in value) {
      state.git.statusMatrix.matrix[filepath] = value[filepath];
    }
  },
  "filter:git.statusMatrix.matrix"(state, filter): void {
    // eslint-disable-next-line functional/no-loop-statement
    for (const filepath in state.git.statusMatrix.matrix) {
      if (filter(filepath) === false) {
        delete state.git.statusMatrix.matrix[filepath];
      }
    }
  },
};

export default mutation;
