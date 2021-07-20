import { Module } from "vuex";

export interface State {
  project: string | null;
  statusMatrix: Array<[string, number, number, number]> | null;
  sessions: string[];
  session: number;
  historySession: number[];
  floatingBrowserX: number | null;
  floatingBrowserY: number | null;
  scrollEnhance: {
    [fullpath: string]: {
      x: number;
      y: number;
      cursorRow: number;
      cursorColumn: number;
    };
  };
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    project: null,
    statusMatrix: null,

    sessions: [],
    session: -1,
    historySession: [],

    floatingBrowserX: null,
    floatingBrowserY: null,

    scrollEnhance: {},
  },
  mutations: {
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
            state.historySession[
              state.historySession.lastIndexOf(session) - 1
            ] ?? Infinity,
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
        index: number;
        value: string;
      }
    ): void {
      state.sessions.splice(index, 1, value);
    },

    setFloatingBrowserX(state, value: number): void {
      state.floatingBrowserX = value;
    },
    setFloatingBrowserY(state, value: number): void {
      state.floatingBrowserY = value;
    },

    setScrollEnhance(
      state,
      {
        file,
        value,
      }: {
        file: string;
        value: {
          x: number;
          y: number;
          cursorRow: number;
          cursorColumn: number;
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
      { file, newFile }: { file: string; newFile: string }
    ): void {
      state.scrollEnhance[newFile] = state.scrollEnhance[file];
      delete state.scrollEnhance[file];
    },
  },
  getters: {
    session(state): string | null {
      return state.sessions[state.session] ?? null;
    },
  },
};

export default store;
