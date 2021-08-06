export type GitProjectStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  state: "loading" | "unready" | "ready";
  // eslint-disable-next-line functional/prefer-readonly-type
  gitignore: string;
};

function state(): GitProjectStateInterface {
  return {
    state: "loading",
    gitignore: "",
  };
}

export default state;
