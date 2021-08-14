export type TerminalStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly lines: {
    readonly color?: string;
    readonly message: string;
  }[];
};

function state(): TerminalStateInterface {
  return {
    lines: [],
  };
}

export default state;
