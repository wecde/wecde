import { Module } from "vuex";

import { StateInterface } from "../index";

import mutations from "./mutations";
import state, { SystemStateInterface } from "./state";

const exampleModule: Module<SystemStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
};

export default exampleModule;
