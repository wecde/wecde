export type TerminalStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly lines: {
    readonly color?: string;
    readonly message: string;
  }[];
  // eslint-disable-next-line functional/prefer-readonly-type
  done: boolean;
};

function state(): TerminalStateInterface {
  return {
    lines: [],

    done: false,
  };
}

export default state;
