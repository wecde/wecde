export default {
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
    setProject(state, value) {
      state.project = value;
      state.sessions.splice(0);
      state.session = null;
      state.historySession.splice(0);
    },
    pushSession(state, session) {
      if (state.sessions.includes(session) === false) {
        state.sessions.push(session);
      }

      state.session = null;
      this.commit("editor/changeSession", session);
    },
    changeSession(state, session) {
      state.session = session;

      if (
        session &&
        state.historySession[state.historySession.length - 1] !== session
      ) {
        state.historySession.push(session);
      }
    },
    removeSession(state, session) {
      let indexSession = state.sessions.lastIndexOf(session) - 1;

      state.sessions = state.sessions.filter((item) => item !== session);

      if (state.session === session) {
        if (indexSession === -1) {
          indexSession = state.sessions.length - 1;
        }

        state.session = state.sessions[indexSession] ?? null;
      }
    },

    setFloatingBrowserX(state, value) {
      state.floatingBrowserX = value;
    },
    setFloatingBrowserY(state, value) {
      state.floatingBrowserY = value;
    },
  },
};
