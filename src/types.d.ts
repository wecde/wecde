declare module "!raw-loader!*" {
  const value: string;
  export default value;
}

declare module "ace-builds/src-noconflict/ext-themelist" {
  const themesByName: unknown;

  export { themesByName };
}
