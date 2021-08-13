import { state as stateOptions } from "./options";

export type SettingsStateInterface = typeof stateOptions;

function state(): SettingsStateInterface {
  return stateOptions;
}

export default state;
