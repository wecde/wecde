import git from "isomorphic-git";
import fs from "modules/fs";
import { join } from "path-cross";
import { configs } from "src/helpers/git";
import { store } from "src/store";

export async function reset(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await git.checkout({
      fs,
      dir: store.state.editor.project,
      filepaths: filepaths.slice(0),
      force: true, // nhà tôi 3 đời <--
      ref: "HEAD",
    });
  }
}
export async function resetIndex(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await Promise.all(
      Object.entries(store.state.editor.git.statusMatrix.matrix)
        .filter(([_filepath]) => filepaths.includes(_filepath))
        .map(async ([filepath, matrix]) => {
          if (matrix.join("") !== "111") {
            await git.resetIndex({
              fs,
              dir: store.state.editor.project as string,
              filepath,
            });

            void store.dispatch("editor/update:matrix-of-filepath", [filepath]);
          }
        })
    );
  }
}
export async function add(filepaths: readonly string[]): Promise<void> {
  if (store.state.editor.project) {
    await Promise.all(
      Object.entries(store.state.editor.git.statusMatrix.matrix)
        .filter(([_filepath]) => filepaths.includes(_filepath))
        .map(async ([filepath, matrix]) => {
          if (matrix.join("") !== "111") {
            if (matrix[0] === 1 && matrix[1] === 0) {
              // deleted
              await git.remove({
                fs,
                dir: store.state.editor.project as string,
                filepath,
              });
            } else {
              await git.add({
                fs,
                dir: store.state.editor.project as string,
                filepath,
              });
            }

            void store.dispatch("editor/update:matrix-of-filepath", [filepath]);
          }
        })
    );
  }
}
export async function commit({
  message,
  amend,
  noEdit,
}: {
  readonly message: string | void;
  readonly amend: boolean;
  readonly noEdit: boolean;
}): Promise<void> {
  if (store.state.editor.project) {
    // eslint-disable-next-line functional/no-let
    let author: {
      readonly name: string;
      readonly email: string;
    };
    if (amend) {
      const logs = await git.log({
        fs,
        dir: store.state.editor.project,
        depth: 2,
        ref: "HEAD",
      });

      if (logs.length < 2) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("Can't commit amend branch empty commit");
      }

      await git.checkout({
        fs,
        dir: store.state.editor.project,
        ref: logs[1].oid,
      });

      // checkout done

      author = logs[0].commit.author;

      if (noEdit === true) {
        message = logs[0].commit.message;
      }
    } else {
      author = configs.authorFor(
        (await git.getConfig({
          fs,
          dir: store.state.editor.project,
          path: "remote.origin.url",
        })) || "https://github.com/"
      );
    }

    const oid = await git.commit({
      fs,
      dir: store.state.editor.project,
      author,
      message: message as string,
      ref: "HEAD", // if not select ref -> run checkout(oid) after oid = commit()
    });

    void store.dispatch(
      "editor/update:matrix-of-filepath",
      Object.keys(store.state.editor.git.statusMatrix.matrix).filter(
        (item) =>
          store.state.editor.git.statusMatrix.matrix[item].join("") !== "111"
      )
    );
    console.info(`Committed ${oid}`);
  }
}

type Branches = readonly {
  readonly name: string;
  readonly path: string;
  readonly "last-oid": string;
}[];
export async function listAllBranches(): Promise<{
  readonly heads?: Branches;
  readonly remotes?: Branches;
  readonly tags?: Branches
}> {
  if (store.state.editor.project) {
    // eslint-disable-next-line functional/no-let
    let heads: readonly string[] = [],
      remotes: readonly string[] = [],
      tags: readonly string[] = [];

    await Promise.allSettled([
      fs.readdir(join(store.state.editor.project, ".git/refs/heads")),
      fs.readdir(join(store.state.editor.project, ".git/refs/remotes")),
      fs.readdir(join(store.state.editor.project, ".git/refs/tags")),
    ]).then(async (status) => {
      if (status[0].status === "fulfilled") {
        heads = status[0].value.map((item) => `heads/${item}`);
      }
      if (status[1].status === "fulfilled") {
        remotes = await Promise.all(
          status[1].value.map(async (remote) => {
            // read
            const refsOfRemote = await fs.readdir(
              join(
                store.state.editor.project as string,
                `.git/refs/remotes/${remote}`
              )
            );

            return refsOfRemote.map((item) => `remotes/${remote}/${item}`);
          })
        ).then((result) => result.flat(1));
      }
      if (status[2].status === "fulfilled") {
        tags = status[2].value.map((item) => `tags/${item}`);
      }
    });

    //ok. start read last-oid
    const result = await Promise.all(
      [heads, remotes, tags].map((refs) =>
        Promise.all(
          refs.map(async (ref) => {
            return {
              name: ref.split("/").slice(1).join("/"),
              path: `refs/${ref}`,
              "last-oid": await fs
                .readFile(
                  join(store.state.editor.project as string, ".git/refs", ref),
                  "utf8"
                )
                .then((res) => res.split("\n")[0]),
            };
          })
        )
      )
    );

    return {
      heads: result[0],
      remotes: result[1],
      tags: result[2],
    };
  }

  return {};
}
