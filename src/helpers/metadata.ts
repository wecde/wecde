import fs from "modules/fs";
import { join, relative } from "path-cross";
import { getPathToMetadataOf, getPathToProjectFrom } from "src/utils/metadata";
import { useGitWorker } from "src/worker/git";

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

export async function getMetadataStatusMatrix(
  fullpath: string,
  autofetch = true
): Promise<{
  readonly [filepath: string]: readonly [0 | 1, 0 | 1 | 2, 0 | 3 | 1 | 2];
} | null> {
  try {
    return JSON.parse(
      await fs.readFile(
        join(getPathToMetadataOf(fullpath), "status-matrix.json"),
        "utf8"
      )
    );
  } catch {
    if (autofetch) {
      await patchMetadataStatusMatrix(fullpath, ["."]);
      return getMetadataStatusMatrix(fullpath);
    }

    return null;
  }
}

export async function setMetadataStatusMatrix(
  fullpath: string,
  matrix: {
    readonly [filepath: string]: readonly [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3];
  }
): Promise<void> {
  await fs.writeFile(
    join(getPathToMetadataOf(fullpath), "status-matrix.json"),
    JSON.stringify(matrix),
    {
      encoding: "utf8",
      recursive: true,
    }
  );
}

export async function patchMetadataStatusMatrix(
  fullpath: string,
  filepaths: readonly string[]
): Promise<void> {
  const matrix = (
    await useGitWorker().statusMatrix({
      dir: getPathToProjectFrom(fullpath),
      fs,
      filepaths,
    })
  ).reduce(
    // eslint-disable-next-line functional/immutable-data
    (obj, [filepath, ...value]) => ((obj[filepath] = value), obj),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any
  );

  // remove item in matrix of file

  const oldMatrix = {
    ...((await getMetadataStatusMatrix(fullpath, false)) || {}),
  };

  // eslint-disable-next-line functional/no-loop-statement
  for (const filepath in oldMatrix) {
    /// if
    if (
      filepaths.some((filepathTest) => {
        if (
          filepath.startsWith(`${filepathTest}/`.replace(/\/{2}/g, "")) ||
          filepath === filepathTest
        ) {
          return true;
        }
      })
    ) {
      // eslint-disable-next-line functional/immutable-data
      delete oldMatrix[filepath];
    }
  }

  console.log(oldMatrix);

  await setMetadataStatusMatrix(fullpath, {
    ...oldMatrix,
    ...matrix,
  });
}
