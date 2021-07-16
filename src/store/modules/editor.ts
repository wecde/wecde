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

      if (state.historySession[state.historySession.length - 1] !== session) {
        state.historySession.push(session);
      }
    },
    removeSession(state, session: number): void {
      state.sessions.splice(session, 1);
      let indexSession = state.historySession.lastIndexOf(session);
      state.historySession = state.historySession.filter(
        (item) => item !== session
      );

      if (state.session === session) {
        if (indexSession === -1) {
          indexSession = state.sessions.length - 1;
        }

        state.session = indexSession;
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
