import git from "isomorphic-git";
import { fs, readFile } from "modules/filesystem";
import { join } from "path-cross";
import { store } from "src/store";
import { rawText, trim } from "src/utils";

import type { Branch, Remote } from "./Git.types";

export async function listRemotes(): Promise<readonly Remote[]> {
  if (store.state.editor.project) {
    return await git.listRemotes({
      fs,
      dir: store.state.editor.project,
    });
  }

  return [];
}

export async function currentBranch({
  dir,
}: {
  readonly dir: string;
}): Promise<string | void> {
  try {
    return await readFile(join(dir, ".git/HEAD")).then((base64) =>
      trim(rawText(base64).replace(/^ref: /, ""))
        .split("/")
        .slice(2)
        .join("/")
    );
  } catch {}
}

export async function listBranches(
  getOnline = false
): Promise<readonly Branch[]> {
  // eslint-disable-next-line functional/prefer-readonly-type
  const promiseGetBranches: Array<Promise<readonly Branch[]>> = [];

  if (store.state.editor.project) {
    const current = await currentBranch({ dir: store.state.editor.project });

    // eslint-disable-next-line functional/immutable-data
    promiseGetBranches.push(
      (async (): Promise<readonly Branch[]> => {
        const branches = await git.listBranches({
          fs,
          dir: store.state.editor.project as string,
        });

        return branches.map((item): Branch => {
          return {
            name: item,
            type: "local",
            at: "0x0",
            current: current === item,
          };
        });
      })()
    );

    if (getOnline) {
      // eslint-disable-next-line functional/immutable-data
      promiseGetBranches.push(
        ...(await listRemotes()).map(async ({ remote }) => {
          const branches = await git.listBranches({
            fs,
            dir: store.state.editor.project as string,
            remote,
          });

          return branches.map((item): Branch => {
            return {
              name: `${remote}/${item}`,
              type: "remote",
              at: "0x0",
              current: current === `${remote}/${item}`,
            };
          });
        })
      );
    }

    // eslint-disable-next-line functional/immutable-data
    promiseGetBranches.push(
      (async () => {
        const branches = await git.listTags({
          fs,
          dir: store.state.editor.project as string,
        });

        return branches.map((item): Branch => {
          return {
            name: item,
            type: "tag",
            at: "0x0",
            current: current === item,
          };
        });
      })()
    );
  }

  return (await Promise.all(promiseGetBranches)).flat(2);
}


