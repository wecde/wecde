import { getFilepathFrom } from "src/utils/metadata";
import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { EditorStateInterface } from "./state";

const getters: GetterTree<EditorStateInterface, StateInterface> = {
  session(state): string | null {
    return state.sessions[state.session] ?? null;
  },
  "status-matrix"({ gitMatrix, project }): (fullpath: string) => string | null {
    return (fullpath) => {
      return project
        ? gitMatrix[getFilepathFrom(project, fullpath)]?.join("") ?? null
        : null;
    };
  },
};

export default getters;
