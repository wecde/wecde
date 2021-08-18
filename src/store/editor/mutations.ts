import { MutationTree } from "vuex";

import { EditorStateInterface } from "./state";

const mutation: MutationTree<EditorStateInterface> = {
  setProject(state, value: string): void {
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

  setScrollEnhance(
    state,
    {
      file,
      value,
    }: {
      readonly file: string;
      readonly value: {
        readonly x: number;
        readonly y: number;
        readonly cursorRow: number;
        readonly cursorColumn: number;
      };
    }
  ): void {
    state.scrollEnhance = {
      ...state.scrollEnhance,
      [file]: value,
    };
  },
  updateFileScrollEnhance(
    state,
    { file, newFile }: { readonly file: string; readonly newFile: string }
  ): void {
    state.scrollEnhance[newFile] = state.scrollEnhance[file];
    delete state.scrollEnhance[file];
  },
  removeScrollEnhance(state, path) {
    delete state.scrollEnhance[path];
  },
};

export default mutation;
