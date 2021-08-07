import { Module } from "vuex";

import { StateInterface } from "../index";

import mutations from "./mutations";
import state, { SettingsStateInterface } from "./state";

const exampleModule: Module<SettingsStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
};

export default exampleModule;
