export type ProjectJSON = {
  // eslint-disable-next-line functional/prefer-readonly-type
  sessions?: readonly string[];
  // eslint-disable-next-line functional/prefer-readonly-type
  "session-history"?: number[];

  readonly "scroll-behavior": {
    readonly [filepath: string]: {
      readonly top: number;
      readonly left: number;
      readonly row: number;
      readonly column: number;
    };
  };
};
