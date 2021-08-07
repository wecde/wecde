import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { EditorStateInterface } from "./state";

const getters: GetterTree<EditorStateInterface, StateInterface> = {
  session(state): string | null {
    return state.sessions[state.session] ?? null;
  },
};

export default getters;
