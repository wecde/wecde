declare module "*Release.json" {
  export type Template = {
    readonly name: string;
    readonly "directory-name": string;
    readonly icons?: readonly string[];
    readonly images?: readonly string[];
    readonly description?: string;
    readonly isTemplate: boolean;
  };

  const value: readonly Template[];

  export default value;
}

declare module "assets/labs/Release.json" {
  export type Template = {
    readonly name: string;
    readonly "directory-name": string;
    readonly icons?: readonly string[];
    readonly images?: readonly string[];
    readonly description?: string;
    readonly isTemplate: boolean;
  };

  const value: readonly Template[];

  export default value;
}
