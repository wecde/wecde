import ignore from "ignore";
import parseIgnore from "parse-gitignore";
import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { GitProjectStateInterface } from "./state";

const getters: GetterTree<GitProjectStateInterface, StateInterface> = {
  ignored(state) {
    return (filename: string) => {
      return (
        ignore()
          .add([".git", ...parseIgnore(state.gitignore)])
          .filter([filename]).length === 0
      );
    };
  },
};

export default getters;
