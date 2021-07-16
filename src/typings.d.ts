declare module "eruda2" {
  const value: any;

  export default value;
}

declare module "vue-timeago.js" {
  import Vue, { PluginOptions } from "vue";

  export default {
    install(Vue: Vue): void;,
  } as PluginOptions;
}

declare module "*/material-icons.json" {
  interface FlatObject {
    [propName: string]: string;
  }

  export const iconDefinitions: {
    [propName: string]: {
      iconPath: string;
    };
  };
  export const folderNames: FlatObject;
  export const folderNames: FlatObject;
  export const folderNamesExpanded: FlatObject;
  export const languageIds: FlatObject;
  export const fileNames: FlatObject;
  export const fileExtensions: FlatObject;

  export const light: {
    folderNamesExpanded: FlatObject;
    folderNames: FlatObject;
    languageIds: FlatObject;
    fileNames: FlatObject;
    fileExtensions: FlatObject;
  };
}

declare module "*/Release.json" {
  export interface Template {
    name: string;
    "directory-name": string;
    icons?: string[];
    images?: string[];
    description?: string;
    isTemplate: boolean;
  }

  const value: Template[];

  export default value;
}

declare module "*.json" {
  const value: any;

  export default value;
}

declare module "raw-loader!*" {
  const contents: string;
  export = contents;
}

declare module "marked" {
  const value: any;

  export default value;
}

declare module "@desislavsd/vue-teleport" {
  import Vue from "vue";

  export const vTeleport: typeof Vue;
  export const vTeleportLocation: typeof Vue;
}

declare module "vue-bus" {
  import Vue, { PluginOptions } from "vue";

  export default {
    install(Vue: Vue): void;,
  } as PluginOptions;
}

declare module "prettier" {
  const value: any;
  const getSupportInfo: any;
  const formatWithCursor: any;
  const format: any;

  export { getSupportInfo, formatWithCursor, format };
  export default value;
}

declare module "*parser-typescript.js" {
  const value: any;

  export default value;
}

declare module "escape-string-regexp" {
  const value: any;

  export default value;
}
