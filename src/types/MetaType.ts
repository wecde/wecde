type typeDef = {
  readonly session: {
    // eslint-disable-next-line functional/prefer-readonly-type
    sessions?: string[];
    // eslint-disable-next-line functional/prefer-readonly-type
    "session-history"?: number[];
  };
  readonly scrolling: {
    readonly [filepath: string]: {
      readonly top: number;
      readonly left: number;
      readonly row: number;
      readonly column: number;
    };
  };
};

export default typeDef;
