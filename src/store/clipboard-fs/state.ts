export type ClipboardFStateInterface = {
  // eslint-disable-next-line functional/prefer-readonly-type
  clipboardFile: string | null;
  // eslint-disable-next-line functional/prefer-readonly-type
  action: "cut" | "copy";
};

function state(): ClipboardFStateInterface {
  return {
    clipboardFile: null,
    action: "copy",
  };
}

export default state;
