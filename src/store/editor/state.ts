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
};

function state(): EditorStateInterface {
  return {
    project: null,

    sessions: [],
    session: -1,
    historySession: [],

    scrollEnhance: {},
  };
}

export default state;
