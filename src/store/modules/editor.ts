import { Module } from "vuex";

export interface State {
  project: string | null;
  directory: string | null;
  sessions: string[];
  session: string | null;
  historySession: string[];
  floatingBrowserX: number | null;
  floatingBrowserY: number | null;
}
const store: Module<State, unknown> = {
  namespaced: true,
  state: {
    project: null,
    directory: null,

    sessions: [],
    session: null,
    historySession: [],

    floatingBrowserX: null,
    floatingBrowserY: null,
  },
  mutations: {
    setProject(state, value: string): void {
      state.project = value;
      state.sessions.splice(0);
      state.session = null;
      state.historySession.splice(0);
    },
    pushSession(state, session: string): void {
      if (state.sessions.includes(session) === false) {
        state.sessions.push(session);
      }

      state.session = null;
      (this as any).commit("editor/changeSession", session);
    },
    changeSession(state, session: string): void {
      state.session = session;

      if (
        session &&
        state.historySession[state.historySession.length - 1] !== session
      ) {
        state.historySession.push(session);
      }
    },
    removeSession(state, session: string): void {
      let indexSession = state.sessions.lastIndexOf(session) - 1;

      state.sessions = state.sessions.filter((item) => item !== session);

      if (state.session === session) {
        if (indexSession === -1) {
          indexSession = state.sessions.length - 1;
        }

        state.session = state.sessions[indexSession] ?? null;
      }
    },

    setFloatingBrowserX(state, value: number): void {
      state.floatingBrowserX = value;
    },
    setFloatingBrowserY(state, value: number): void {
      state.floatingBrowserY = value;
    },
  },
};

export default store;
