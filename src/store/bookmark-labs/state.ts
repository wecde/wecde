import type { Template } from "assets/labs/Release.json";

export type BookmarkLabsStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  labs: Template[];
};

function state(): BookmarkLabsStateInterface {
  return {
    labs: [],
  };
}

export default state;
