export type GitProjectStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  state: "loading" | "unready" | "ready";
  // eslint-disable-next-line functional/prefer-readonly-type
  isLoading: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  matrixStatus: Record<string, string>;
  // eslint-disable-next-line functional/prefer-readonly-type
  gitignore: string;
};

function state(): GitProjectStateInterface {
  return {
    state: "loading",
    isLoading: false,
    matrixStatus: {},
    gitignore: "",
  };
}

export default state;
