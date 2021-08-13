import { Module } from "vuex";

import { StateInterface } from "../index";

import getters from "./getters";
import mutations from "./mutations";
import state, { GitConfigsStateInterface } from "./state";

const exampleModule: Module<GitConfigsStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
  getters,
};

export default exampleModule;
