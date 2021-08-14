export type StatusGit =
  | "modified"
  | "ignored"
  | "unmodified"
  | "*modified"
  | "*deleted"
  | "*added"
  | "absent"
  | "deleted"
  | "added"
  | "*unmodified"
  | "*absent"
  | "*undeleted"
  | "*undeletemodified";
export type StatusMatrix = {
  readonly [filepath: string]: {
    readonly status: StatusGit;
    readonly filepath: string;
  };
};
export type Change = {
  readonly fullpath: string;
  readonly filepath: string;
  readonly status: StatusGit;
  readonly basename: string;
};
export type Remote = {
  readonly remote: string;
  readonly url: string;
};

export type Branch = {
  readonly name: string;
  readonly type: "local" | "remote" | "tag";
  readonly at: string;
  readonly current: boolean;
};
