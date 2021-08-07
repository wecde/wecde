import { Module } from "vuex";

import { StateInterface } from "../index";

import mutations from "./mutations";
import state, { TerminalStateInterface } from "./state";

const exampleModule: Module<TerminalStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
};

export default exampleModule;
