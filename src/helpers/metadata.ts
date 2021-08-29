import fs from "modules/fs";
import { join, relative } from "path-cross";
import { getPathToMetadataOf, getPathToProjectFrom } from "src/utils/metadata";

type MetdadataProject = {
  readonly "scroll-behavior": {
    // eslint-disable-next-line functional/prefer-readonly-type
    [filepath: string]: {
      readonly top: number;
      readonly left: number;
      readonly row: number;
      readonly column: number;
    };
  };
};

async function getMetadataProject(fullpath: string): Promise<MetdadataProject> {
  try {
    return JSON.parse(
      await fs.readFile(
        join(getPathToMetadataOf(fullpath), "project.json"),
        "utf8"
      )
    );
  } catch {
    return {
      "scroll-behavior": {},
    };
  }
}

async function setMetadataProject(
  fullpath: string,
  data: MetdadataProject
): Promise<void> {
  await fs.writeFile(
    join(getPathToMetadataOf(fullpath), "project.json"),
    JSON.stringify(data),
    {
      encoding: "utf8",
      recursive: true,
    }
  );
}

export async function setScrollBehavior(
  fullpath: string,
  data: MetdadataProject["scroll-behavior"][0]
) {
  const metadataProject = await getMetadataProject(fullpath);

  const path = relative(getPathToProjectFrom(fullpath), fullpath);

  // eslint-disable-next-line functional/immutable-data
  metadataProject["scroll-behavior"][path] = data;

  await setMetadataProject(fullpath, metadataProject);
}

export async function getScrollBehavior(
  fullpath: string
): Promise<MetdadataProject["scroll-behavior"][0]> {
  const metadataProject = await getMetadataProject(fullpath);

  const path = relative(getPathToProjectFrom(fullpath), fullpath);

  return (
    metadataProject["scroll-behavior"][path] || {
      top: 0,
      left: 0,
      row: 0,
      column: 0,
    }
  );
}
