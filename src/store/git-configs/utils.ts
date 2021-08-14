import { hosts, HostType } from "./state";

export function getHostType(url: string): HostType {
  url = url.toLocaleLowerCase()

  if ( url.includes("://") === false ) {
    url = "http://" + url
  }

  const { hostname } = new URL("/", url);

  const host: HostType = (hostname in hosts ? hostname : "*") as HostType;

  return host;
}
