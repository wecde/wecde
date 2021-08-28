export type EditorStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  project: string | null;
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly sessions: string[];
  // eslint-disable-next-line functional/prefer-readonly-type
  session: number;
  // eslint-disable-next-line functional/prefer-readonly-type
  historySession: number[];
  // eslint-disable-next-line functional/prefer-readonly-type
  scrollEnhance: Record<
    string,
    {
      readonly x: number;
      readonly y: number;
      readonly cursorRow: number;
      readonly cursorColumn: number;
    }
  >;
  // eslint-disable-next-line functional/prefer-readonly-type
  git: "unknown" | "ready" | "unready";
  // eslint-disable-next-line functional/prefer-readonly-type
  gitMatrixLoading: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  gitMatrix: {
    readonly [filepath: string]: readonly [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3];
  };
};

function state(): EditorStateInterface {
  return {
    project: null,

    sessions: [],
    session: -1,
    historySession: [],

    scrollEnhance: {},

    git: "unknown",
    gitMatrixLoading: false,
    gitMatrix: {},
  };
}

export default state;
