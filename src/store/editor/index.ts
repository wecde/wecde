import { Module } from "vuex";

import { StateInterface } from "../index";

import getters from "./getters";
import mutations from "./mutations";
import state, { EditorStateInterface } from "./state";

const exampleModule: Module<EditorStateInterface, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  state,
};

export default exampleModule;
