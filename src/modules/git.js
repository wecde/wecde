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

function Err(name) {
  return class extends Error {
    constructor(...args) {
      super(...args);
      this.code = name;
      if (this.message) {
        this.message = name + ": " + this.message;
      } else {
        this.message = name;
      }
    }
  };
}

// eslint-disable-next-line no-unused-vars
const EEXIST = Err("EEXIST");
const ENOENT = Err("ENOENT");
// eslint-disable-next-line no-unused-vars
const ENOTDIR = Err("ENOTDIR");
// eslint-disable-next-line no-unused-vars
const ENOTEMPTY = Err("ENOTEMPTY");
// eslint-disable-next-line no-unused-vars
const ETIMEDOUT = Err("ETIMEDOUT");

class Stat {
  constructor(stats) {
    this.type = stats.type;
    this.mode = stats.mode || 16822;
    this.size = stats.size;
    this.ino = stats.ino || 2814749767351612;
    this.mtimeMs = stats.mtime;
    this.ctimeMs = stats.ctime || stats.mtime;
    this.uid = 1;
    this.gid = 1;
    this.dev = 1761345728;
  }
  isFile() {
    return this.type === "file";
  }
  isDirectory() {
    return this.type === "directory";
  }
  isSymbolicLink() {
    return this.type === "symlink";
  }
}

const fs = {
  promises: {
    readFile(path, { encoding } = {}) {
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

    writeFile(path, data) {
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
    mkdir(path) {
      return mkdir(path);
    },
    rmdir(path) {
      return rmdir(path);
    },
    unlink(path) {
      return unlink(path);
    },
    stat(path) {
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
    lstat(path) {
      return this.stat(path);
    },
    readdir(path) {
      return readdir(path);
    },
    readlink(path) {
      return this.readFile(path);
    },
    symlink(path, data) {
      return writeFile(path, data);
    },
  },
};

function getAuthFromProvide(url) {
  let auth = {
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

export async function clone({ dir, url, ref }) {
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
        "terminal/push",
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
