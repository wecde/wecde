export type EditorStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  project: string | null;
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly sessions: string[];
  // eslint-disable-next-line functional/prefer-readonly-type
  session: number;
  // eslint-disable-next-line functional/prefer-readonly-type
  historySession: number[];
  readonly git: {
    // eslint-disable-next-line functional/prefer-readonly-type
    status: "unknown" | "ready" | "unready";
    readonly statusMatrix: {
      // eslint-disable-next-line functional/prefer-readonly-type
      loading: boolean;
      readonly matrix: {
        // eslint-disable-next-line functional/prefer-readonly-type
        [filepath: string]: readonly [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3];
      };
    };
  };
};

function state(): EditorStateInterface {
  return {
    project: null,

    sessions: [],
    session: -1,
    historySession: [],

    git: {
      status: "unknown",
      statusMatrix: {
        loading: false,
        matrix: {},
      },
    },
  };
}

export default state;
