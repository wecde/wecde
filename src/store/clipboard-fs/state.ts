export type ClipboardFStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly objects: {
    readonly path: string;
    readonly vue: number;
  }[];
  // eslint-disable-next-line functional/prefer-readonly-type
  action: "cut" | "copy";
};

function state(): ClipboardFStateInterface {
  return {
    objects: [],
    action: "copy",
  };
}

export default state;
