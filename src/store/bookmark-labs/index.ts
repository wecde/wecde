import { Module } from "vuex";

import { StateInterface } from "../index";

import mutations from "./mutations";
import state, { BookmarkLabsStateInterface } from "./state";

const BookmarkLabs: Module<BookmarkLabsStateInterface, StateInterface> = {
  namespaced: true,
  mutations,
  state,
};

export default BookmarkLabs;
