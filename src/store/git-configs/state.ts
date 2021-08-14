/* eslint-disable functional/prefer-readonly-type */

export type GitRcItem = {
  username: string;
  password: string;
  email: string;
  name: string;
};

export type HostType = keyof typeof hosts;

export const hosts = {
  "github.com": "GitHub",
  "bitbucket.org": "BitBucket",
  "gitlab.com": "GitLab",
  "dev.azure.com": "Dev Azure Ops",
  "*": "Other",
};

export type GitConfigsStateInterface = {
  [hostgit in HostType]: GitRcItem;
} & {
  viewAs: "list" | "tree";
  sortBy: "name" | "path" | "status";
};

function state(): GitConfigsStateInterface {
  const state: GitConfigsStateInterface = {
    viewAs: "list",
    sortBy: "path",

    "github.com": {
      username: "",
      password: "",
      email: "",
      name: "",
    },
    "gitlab.com": {
      username: "",
      password: "",
      email: "",
      name: "",
    },
    "bitbucket.org": {
      username: "",
      password: "",
      email: "",
      name: "",
    },
    "dev.azure.com": {
      username: "",
      password: "",
      email: "",
      name: "",
    },
    "*": {
      username: "",
      password: "",
      email: "",
      name: "",
    },
  };

  return state;
}

export default state;
