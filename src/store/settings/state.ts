import { state as stateOptions } from "./options";

export type GitInfo = {
  readonly username: string;
  readonly password: string;
  readonly email: string;
  readonly name: string;
};

export const providersGIT = {
  "github.com": "GitHub",
  "bitbucket.org": "BitBucket",
  "gitlab.com": "GitLab",
  "dev.azure.com": "Dev Azure Ops",
  "*": "Other",
};

export type SettingsStateInterface = typeof stateOptions;

function state(): SettingsStateInterface {
  return stateOptions;
}

export default state;
