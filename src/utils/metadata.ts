import fs from "modules/fs";
import { join, relative } from "path-cross";

export function getFilepathFrom(project: string, fullpath: string): string {
  return relative(fs.relatively(project), fs.relatively(fullpath));
}

export function getPathToProjectFrom(fullpath: string): string {
  const fullpathSplit = join("./", fullpath)
    .split("/")
    .filter((item) => item !== "" && item !== ".");

  if (fullpathSplit[0] === "projects") {
    return fullpathSplit.slice(0, 2).join("/");
  }

  // eslint-disable-next-line functional/no-throw-statement
  throw new Error(`${fullpath} is not path project`);
}

export function getPathToMetadataOf(fullpath: string): string {
  return join(".metadata", relative("projects", getPathToProjectFrom(fullpath)))
}