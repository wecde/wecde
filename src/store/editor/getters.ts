import fs from "modules/fs";
import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { EditorStateInterface } from "./state";

const getters: GetterTree<EditorStateInterface, StateInterface> = {
  session(state): string | null {
    return state.sessions[state.session] ?? null;
  },
  "status:filepath"({ git, project }): (fullpath: string) => string | null {
    return (fullpath, isFolder = false) => {
      if (!project) {
        return null;
      }

      if (isFolder) {
        const filepathFolder = `${fs.relative(project, fullpath)}/`.replace(
          /\/{2,}/g,
          "/"
        ); // format: examples/, src/, docs/

        // eslint-disable-next-line functional/no-let
        let modified = false;
        // eslint-disable-next-line functional/no-let
        let deleted = false;

        // eslint-disable-next-line functional/no-loop-statement
        for (const [filepath, matrix] of Object.entries(
          git.statusMatrix.matrix
        )) {
          if (filepath.startsWith(filepathFolder)) {
            // item is children folder fullpath
            if (matrix[0] === 0 && matrix[1] === 2) {
              /// if added : matrix = 020, 022, 023
              return "02x";
            }
            if (matrix[0] === 1 && matrix[1] === 2) {
              /// if modified : matrix = 121, 122, 123
              modified = true;
            }
            if (matrix[0] === 1 && matrix[1] === 0) {
              /// if modified : deleted = 101, 100
              deleted = true;
            }
          }
        }

        if (deleted) {
          return "10x";
        }

        if (modified) {
          return "12x";
        }

        return null;
      } else {
        return project
          ? git.statusMatrix.matrix[fs.relative(project, fullpath)]?.join("") ??
              null
          : null;
      }
    };
  },
  "changes.length"({ git }): number {
    return Object.values(git.statusMatrix.matrix).filter(
      (item) => item.join("") !== "111"
    ).length;
  },
  "changes-staged.length"({ git }): number {
    return Object.values(git.statusMatrix.matrix).filter(
      (item) => item.join("") !== "111" && item[2] === 2
    ).length;
  },
};

export default getters;
