import { Module } from "vuex";

import { StateInterface } from "../index";

import mutations from "./mutations";
import state, { SettingsStateInterface } from "./state";

import "./register-options-default";

const exampleModule: Module<SettingsStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
};

export default exampleModule;
