import git from "isomorphic-git";
import http from "isomorphic-git/http/web/index.js";
import {
  readFile,
  writeFile,
  mkdir,
  unlink,
  stat,
  readdir,
  rmdir,
} from "./filesystem";
import { base64ToArrayBuffer, rawText } from "@/utils";
import $store from "@/store";
import { Toast } from "@capacitor/toast";
import { StatResult } from "@capacitor/filesystem";

function Err(name: string): any {
  return class extends Error {
    public code: string = name;

    constructor(...args: any[]) {
      super(...args);
      if (this.message) {
        this.message = name + ": " + this.message;
      } else {
        this.message = name;
      }
    }
  };
}

// eslint-disable-next-line no-unused-vars
// const EEXIST = Err("EEXIST");
const ENOENT = Err("ENOENT");
// eslint-disable-next-line no-unused-vars
// const ENOTDIR = Err("ENOTDIR");
// eslint-disable-next-line no-unused-vars
// const ENOTEMPTY = Err("ENOTEMPTY");
// eslint-disable-next-line no-unused-vars
// const ETIMEDOUT = Err("ETIMEDOUT");

class Stat {
  public type: string;
  public mode = 16822;
  public size: number;
  public ino = 2814749767351612;
  public mtimeMs: number;
  public ctimeMs: number;
  public uid = 1;
  public gid = 1;
  public dev = 1761345728;

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
      { encoding }: { encoding?: "utf8" } = {}
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
    readdir(path: string): Promise<string[]> {
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

function getAuthFromProvide(url: string):
  | {
      cancel: true;
    }
  | {
      username: string;
      password: string;
    } {
  let auth:
    | {
        cancel: true;
      }
    | {
        username: string;
        password: string;
      } = {
    cancel: true,
  };
  let provide = new URL(url).hostname;

  if (provide in $store.state.settings.git === false) {
    provide = "*";
  }

  if (
    !!$store.state.settings.git[provide].username &&
    !!$store.state.settings.git[provide].secure
  ) {
    auth = {
      username: $store.state.settings.git[provide].username,
      password: $store.state.settings.git[provide].secure,
    };
  }

  return auth;
}

export async function clone({
  dir,
  url,
  ref,
}: {
  dir: string;
  url: string;
  ref?: string;
}): Promise<void> {
  $store.commit("terminal/print", `Cloning repo "${url}"...`);
  await git.clone({
    fs,
    http,
    dir,
    corsProxy: "https://cors.isomorphic-git.org",
    url,
    ref,
    singleBranch: $store.state.settings.cloneGit.singleBranch,
    noCheckout: $store.state.settings.cloneGit.noCheckout,
    noTags: $store.state.settings.cloneGit.noTags,
    ...(Number.isNaN(+$store.state.settings.cloneGit.depth)
      ? {}
      : {
          depth: +$store.state.settings.cloneGit.depth,
        }),
    // eslint-disable-next-line no-extra-boolean-cast
    ...(!!$store.state.settings.cloneGit.since
      ? {
          since: $store.state.settings.cloneGit.since,
        }
      : {}),
    exclude:
      $store.state.settings.cloneGit.exclude
        ?.replace(/,\s+/g, ",")
        .split(",")
        .filter(Boolean) ?? [],

    onProgress(event) {
      $store.commit(
        "terminal/print",
        `${event.phase} (${
          event.total
            ? Math.round((event.loaded / event.total) * 100) + "%"
            : event.loaded
        })`
      );
    },
    onMessage: console.log,
    onAuth(url) {
      const auth = getAuthFromProvide(url);

      $store.commit("terminal/warning", "Clone repo failure 403. Try login...");

      return auth;
    },
    onAuthFailure() {
      $store.commit("terminal/error", "Access was denied. Login failure!");
      Toast.show({
        text: "Login GIT failure.",
      });

      return {
        cancel: true,
      };
    },
    onAuthSuccess() {
      $store.commit("terminal/success", "Login success!");
    },
  });
}
