import { Module } from "vuex";

import { StateInterface } from "../index";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state, { EditorStateInterface } from "./state";


const exampleModule: Module<EditorStateInterface, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  state,
  actions,
};

export default exampleModule;
