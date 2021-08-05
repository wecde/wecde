import { StatResult } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";
import { i18n } from "boot/i18n";
import type { Ignore } from "ignore";
import git, { FetchResult, ReadCommitResult } from "isomorphic-git";
import http from "isomorphic-git/http/web/index.js";
import { join, relative } from "path-cross";
import { store } from "src/store";
import { providersGIT } from "src/store/settings/state";
import { base64ToArrayBuffer, rawText } from "src/utils";

import {
  mkdir,
  readdir,
  readFile,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "./filesystem";
// import ignore from "ignore"
// import parseIgnore from "parser-gitignore"

function Err(name: string) {
  return class extends Error {
    public readonly code: string = name;

    constructor(err: string) {
      super(err);
      if (this.message) {
        this.message = name + ": " + this.message;
      } else {
        this.message = name;
      }
    }
  };
}

// const EEXIST = Err("EEXIST");
const ENOENT = Err("ENOENT");
// const ENOTDIR = Err("ENOTDIR");
// const ENOTEMPTY = Err("ENOTEMPTY");
// const ETIMEDOUT = Err("ETIMEDOUT");

class Stat {
  public readonly type: string;
  public readonly mode = 16822;
  public readonly size: number;
  public readonly ino = 2814749767351612;
  public readonly mtimeMs: number;
  public readonly ctimeMs: number;
  public readonly uid = 1;
  public readonly gid = 1;
  public readonly dev = 1761345728;

  constructor(stats: StatResult) {
    this.type = stats.type;
    this.size = stats.size;
    this.mtimeMs = stats.mtime;
    this.ctimeMs = stats.ctime || stats.mtime;
  }
  isFile(): boolean {
    return this.type === "file";
  }
  isDirectory(): boolean {
    return this.type === "directory";
  }
  isSymbolicLink(): boolean {
    return this.type === "symlink";
  }
}

const fs = {
  promises: {
    readFile(
      path: string,
      { encoding }: { readonly encoding?: "utf8" } = {}
    ): Promise<ArrayBuffer | string> {
      return new Promise((resolve, reject) => {
        readFile(path)
          .then((base64) => {
            if (encoding === "utf8") {
              resolve(rawText(base64));
            }

            resolve(base64ToArrayBuffer(base64));
          })
          .catch(() => {
            reject(new ENOENT(path));
          });
      });
    },

    writeFile(
      path: string,
      data: ArrayBuffer | Uint8Array | Blob | string
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        writeFile(path, data)
          .then((st) => {
            resolve(st);
          })
          .catch((err) => {
            console.log(err);
            reject();
          });
      });
    },
    mkdir(path: string): Promise<void> {
      return mkdir(path);
    },
    rmdir(path: string): Promise<void> {
      return rmdir(path);
    },
    unlink(path: string): Promise<void> {
      return unlink(path);
    },
    stat(path: string): Promise<Stat> {
      return new Promise((resolve, reject) => {
        stat(path)
          .then((st) => {
            resolve(new Stat(st));
          })
          .catch(() => {
            reject(new ENOENT(path));
          });
      });
    },
    lstat(path: string): Promise<Stat> {
      return this.stat(path);
    },
    readdir(path: string): Promise<readonly string[]> {
      return readdir(path);
    },
    readlink(path: string): Promise<ArrayBuffer | string> {
      return this.readFile(path);
    },
    symlink(
      path: string,
      data: ArrayBuffer | Uint8Array | Blob | string
    ): Promise<void> {
      return writeFile(path, data);
    },
  },
};

function getProvide(url: string): string {
  const provide = new URL(url).hostname;

  if (provide in providersGIT) {
    return provide;
  }

  return "*";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAuthFromProvide(url: string): any {
  const provide = getProvide(url);

  return store.state.settings["git__" + provide];
}

/// utils

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onProgress(event: any): void {
  store.commit(
    "terminal/print",
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `${event.phase} (${
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      event.total
        ? Math.round((event.loaded / event.total) * 100) + "%"
        : event.loaded
    })`
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onAuth(url: any): any {
  const auth = getAuthFromProvide(url);

  store.commit("terminal/warning", i18n.global.rt("Git 403 Try login..."));

  return auth;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onAuthFailure(): any {
  store.commit(
    "terminal/error",
    i18n.global.rt("Access was denied Login failure!")
  );
  void Toast.show({
    text: i18n.global.rt("Login GIT failure"),
  });

  return {
    cancel: true,
  };
}
function onAuthSuccess() {
  store.commit("terminal/success", i18n.global.rt("Login success!"));
}

// export

export async function init(dir: string): Promise<void> {
  await git.init({ fs, dir });
}

export async function clone({
  dir,
  url,
  ref,
}: {
  readonly dir: string;
  readonly url: string;
  readonly ref?: string;
}): Promise<void> {
  store.commit(
    "terminal/print",
    i18n.global.rt("Cloning repo {url}", {
      url,
    })
  );
  await git.clone({
    fs,
    http,
    dir,
    corsProxy: "https://cors.isomorphic-git.org",
    url,
    ref,
    cache: {},
    singleBranch: store.state.settings["clone git**single branch"] as
      | boolean
      | undefined,
    noCheckout: store.state.settings["clone git**no checkout"] as
      | boolean
      | undefined,
    noTags: !!store.state.settings["clone git**no tags"],
    ...(Number.isNaN(+(store.state.settings["clone git**depth"] as number))
      ? {}
      : {
          depth: +(store.state.settings["clone git**depth"] as number),
        }),

    ...(!!store.state.settings["clone git**single branch"]
      ? {
          since: store.state.settings["clone git**single branch"] as
            | Date
            | undefined,
        }
      : {}),
    exclude:
      ((store.state.settings["clone git**exclude"] as string) || "")
        ?.replace(/,\s+/g, ",")
        .split(",")
        .filter(Boolean) ?? [],

    onProgress,
    onMessage: console.log,
    onAuth,
    onAuthFailure,
    onAuthSuccess,
  });
}

export async function commit({
  dir,
  message,
}: {
  readonly dir: string;
  readonly message: string;
}): Promise<void> {
  const auth = await listRemotes({ dir });
  const provide = getProvide(auth?.[0].url || "");

  void (await git.commit({
    fs,
    dir,
    message,
    onSign: onAuth,
    cache: {},
    author: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: (store.state.settings["git__" + provide] as any)?.name as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      email: (store.state.settings["git__" + provide] as any)?.email as string,
    },
  }));
}

export function listRemotes({ dir }: { readonly dir: string }): Promise<
  readonly {
    readonly remote: string;
    readonly url: string;
  }[]
> {
  return git.listRemotes({
    fs,
    dir,
  });
}

export async function log({
  dir,
  ref = "HEAD",
  force = false,
}: {
  readonly dir: string;
  readonly ref: string;
  readonly depth: number;
  readonly force: boolean;
}): Promise<readonly ReadCommitResult[]> {
  return await git.log({
    fs,
    dir,
    ref,

    cache: {},

    ...(!!store.state.settings["clone git**depth"]
      ? {
          depth: store.state.settings["clone git**depth"] as number,
        }
      : {}),

    ...(!!store.state.settings["clone git**since date"]
      ? {
          since: store.state.settings["clone git**since date"] as
            | Date
            | undefined,
        }
      : {}),

    force,
  });
}

export async function fetch({
  dir,
  url,
  ref,
  remoteRef,
}: {
  readonly dir: string;
  readonly url: string;
  readonly ref: string;
  readonly remoteRef: string;
  readonly depth: number;
}): Promise<FetchResult> {
  return await git.fetch({
    fs,
    http,
    dir,
    corsProxy: "https://cors.isomorphic-git.org",
    url,
    ref,
    cache: {},

    onProgress,
    onAuth,
    onAuthFailure,
    onAuthSuccess,

    remoteRef,

    singleBranch: store.state.settings["clone git**single branch"] as boolean,
    ...(!store.state.settings["clone git**depth"]
      ? {}
      : {
          depth: store.state.settings["clone git**depth"] as number,
        }),

    ...(!!store.state.settings["clone git**since date"]
      ? {
          since: store.state.settings["clone git**since date"] as
            | Date
            | undefined,
        }
      : {}),
    exclude:
      (store.state.settings["clone git**exclude"] as string)
        ?.replace(/,\s+/g, ",")
        .split(",")
        .filter(Boolean) ?? [],
  });
}

export async function status({
  dir,
  filepath,
  cache,
}: {
  readonly dir: string;
  readonly filepath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly cache?: any;
}): Promise<string> {
  return await git.status({
    fs,
    dir,
    filepath,
    cache,
  });
}

export async function has({ dir }: { readonly dir: string }): Promise<boolean> {
  try {
    return !!(await stat(join(dir, ".git")));
  } catch {
    return false;
  }
}

export async function listFiles({
  dir,
  ref,
}: {
  readonly dir: string;
  readonly ref?: string;
}): Promise<readonly string[]> {
  return await git.listFiles({
    fs,
    dir,
    ref,
  });
}

export async function statusMatrix({
  dir,
  ref,
  cache,
}: {
  readonly dir: string;
  readonly ref?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly cache?: any;
}): Promise<readonly (readonly [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3])[]> {
  return await git.statusMatrix({
    fs,
    dir,
    ref,
    cache,
  });
}

export async function scanRepo({
  dir,
  ref,
}: {
  readonly dir: string;
  readonly ref?: string;
}): Promise<readonly string[]> {
  return await listFiles({ dir, ref });
  // const cache = Object.create(null);
  // const [lists, status] = await Promise.all([
  //   await listFiles({ dir, ref }), // ? fast!
  //   await (statusMatrix({ dir, ref, cache }).then((item) =>
  //     item.map((item) => item[0])
  //   ) as Promise<string[]>), // ! long.....
  // ]);

  // return new Set<string>([...lists, ...status].sort());
}

export async function scanDir(
  dir: string,
  ig: Ignore,
  dirname: string
): Promise<readonly string[]> {
  const files = ig
    .filter(
      (await readdir(dir)).map((item) => join(relative(dirname, dir), item))
    )
    .map((item) => {
      return relative(relative(dirname, dir), item);
    });

  return (
    await Promise.all(
      files.map(async (item) => {
        item = join(dir, item);

        try {
          const result = await scanDir(item, ig, dirname);

          if (result.length === 0) {
            // eslint-disable-next-line functional/no-throw-statement
            throw new Error("DIR_EMPTY");
          }

          return result;
        } catch {
          return item;
        }
      })
    )
  ).flat(2);
}
