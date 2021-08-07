declare namespace NodeJS {
  // eslint-disable-next-line functional/prefer-type-literal
  interface ProcessEnv {
    readonly NODE_ENV: string;
    readonly VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined;
    readonly VUE_ROUTER_BASE: string | undefined;
  }
}
