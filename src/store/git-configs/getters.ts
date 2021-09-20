import { GetterTree } from "vuex";

import { StateInterface } from "../index";

import { GitConfigsStateInterface, GitRcItem, hosts, HostType } from "./state";

function getHostType(url: string): HostType {
  url = url.toLocaleLowerCase();

  if (url.includes("://") === false) {
    url = "http://" + url;
  }

  const { hostname } = new URL("/", url);

  const host: HostType = (hostname in hosts ? hostname : "*") as HostType;

  return host;
}

const getters: GetterTree<GitConfigsStateInterface, StateInterface> = {
  getConfig(state) {
    return (url: string, prop?: keyof GitRcItem): string | GitRcItem => {
      const host = getHostType(url);
      return prop ? state[host][prop] : state[host];
    };
  },
};

export default getters;
