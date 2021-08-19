export type GitProjectStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  status: "unknown" | "unready" | "ready";
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
    status: "unknown",
    gitignore: "",
    matrix: {
      loading: false,
      value: {},
    },
  };
}

export default state;
