import { Module } from "vuex";

import { StateInterface } from "../index";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state, { GitProjectStateInterface } from "./state";

const exampleModule: Module<GitProjectStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state,
};

export default exampleModule;
