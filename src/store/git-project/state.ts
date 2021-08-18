export type GitProjectStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  state: "loading" | "unready" | "ready";
  // eslint-disable-next-line functional/prefer-readonly-type
  gitignore: string;
  readonly matrix: {
    // eslint-disable-next-line functional/prefer-readonly-type
    loading: boolean;
    readonly value: Record<string, readonly [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]>;
  };
};

function state(): GitProjectStateInterface {
  return {
    state: "loading",
    gitignore: "",
    matrix: {
      loading: false,
      value: {},
    },
  };
}

export default state;
