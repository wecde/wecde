/* eslint-env worker */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).window = self;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const window = self;

import {
  add,
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  checkout,
  clone,
  commit,
  getConfig,
  init,
  isIgnored,
  listBranches,
  listRemotes,
  listTags,
  MessageCallback,
  ProgressCallback,
  pull,
  push,
  remove,
  resetIndex,
  STAGE,
  status,
  TREE,
  walk,
  WORKDIR,
} from "isomorphic-git-fast";
import http from "isomorphic-git-fast/http/web/index.js";
import type fs from "modules/fs";
import { join, resolve } from "path-cross";
import { cacheToJson, jsonToCache } from "src/helpers/git-cache";
import type { Cache } from "src/helpers/git-cache";
import { expose } from "workercom";

const GET_PATH_CACHE_STATUS = (dir: string) => join(dir, ".git/.cache/status");

function worthWalking(filepath: string, root: string): boolean {
  if (filepath === "." || root == null || root.length === 0 || root === ".") {
    return true;
  }
  if (root.length >= filepath.length) {
    return root.startsWith(filepath);
  } else {
    return filepath.startsWith(root);
  }
}
const cache: Cache & {
  // eslint-disable-next-line functional/prefer-readonly-type
  dir?: string;
} = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).cache = cache;
export type GitRemoteInterface = {
  readonly clone: (options: {
    readonly dir: string;
    readonly url: string;
    readonly fs: typeof fs;
    readonly corsProxy?: string | undefined;
    readonly ref?: string | undefined;
    readonly singleBranch?: boolean | undefined;
    readonly noCheckout?: boolean | undefined;
    readonly noTags?: boolean | undefined;
    readonly remote?: string | undefined;
    readonly depth?: number | undefined;
    readonly since?: Date | undefined;
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly exclude?: string[] | undefined;
    readonly resolve?: boolean | undefined;
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly headers?: { [x: string]: string } | undefined;
    readonly onAuth: AuthCallback;
    readonly onAuthSuccess: AuthSuccessCallback;
    readonly onAuthFailure: AuthFailureCallback;
    readonly onMessage?: MessageCallback;
    readonly onProgress: ProgressCallback;
  }) => Promise<void>;
  readonly listRemotes: typeof listRemotes;
  readonly listBranches: typeof listBranches;
  readonly listTags: typeof listTags;
  readonly checkout: typeof checkout;
  readonly getConfig: typeof getConfig;
  readonly add: typeof add;
  readonly remove: typeof remove;
  readonly resetIndex: typeof resetIndex;
  readonly commit: typeof commit;
  readonly init: typeof init;
  readonly push: (options: {
    readonly fs: typeof fs;
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly ref?: string | undefined;
    readonly url?: string | undefined;
    readonly remote?: string | undefined;
    readonly remoteRef?: string | undefined;
    readonly force?: boolean | undefined;
    readonly delete?: boolean | undefined;
    readonly corsProxy?: string | undefined;
    readonly headers?: { readonly [x: string]: string } | undefined;

    readonly onAuth: AuthCallback;
    readonly onAuthSuccess: AuthSuccessCallback;
    readonly onAuthFailure: AuthFailureCallback;
    readonly onMessage?: MessageCallback;
    readonly onProgress: ProgressCallback;
  }) => Promise<void>;
  readonly pull: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
    readonly gitdir?: string | undefined;
    readonly ref?: string | undefined;
    readonly url?: string | undefined;
    readonly remote?: string | undefined;
    readonly remoteRef?: string | undefined;
    readonly corsProxy?: string | undefined;
    readonly singleBranch?: boolean | undefined;
    readonly fastForwardOnly?: boolean | undefined;
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly headers?: { [x: string]: string } | undefined;
    readonly author?:
      | {
          // eslint-disable-next-line functional/prefer-readonly-type
          name?: string | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          email?: string | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          timestamp?: number | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          timezoneOffset?: number | undefined;
        }
      | undefined;
    readonly committer?:
      | {
          // eslint-disable-next-line functional/prefer-readonly-type
          name?: string | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          email?: string | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          timestamp?: number | undefined;
          // eslint-disable-next-line functional/prefer-readonly-type
          timezoneOffset?: number | undefined;
        }
      | undefined;
    readonly signingKey?: string | undefined;
    readonly onAuth: AuthCallback;
    readonly onAuthSuccess: AuthSuccessCallback;
    readonly onAuthFailure: AuthFailureCallback;
    readonly onMessage?: MessageCallback;
    readonly onProgress: ProgressCallback;
  }) => Promise<void>;
  readonly status: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
    readonly gitdir?: string | undefined;
    readonly filepath: string;
    readonly force?: boolean;
  }) => Promise<string>;
  readonly statusMatrix: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
    readonly gitdir?: string;
    readonly ref?: string;
    readonly filepaths?: readonly string[];
    readonly filter?: (filepath: string) => boolean;
    readonly force?: boolean;
  }) => Promise<readonly (readonly [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2])[]>;
  // * @for cache
  readonly clearCache: () => void;
  readonly removeCache: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
  }) => Promise<void>;
  readonly saveCache: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
  }) => Promise<void>;
  readonly saveCacheForce: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
  }) => Promise<void>;
  readonly loadCache: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
  }) => Promise<void>;
};

function callbacks(): GitRemoteInterface {
  return {
    async clone(options) {
      await clone({
        http,
        ...options,
      });
    },
    listRemotes,
    listBranches,
    listTags,
    checkout,
    getConfig,
    add,
    remove,
    resetIndex,
    commit,
    init,
    async push(params) {
      await push({
        http,
        ...params,
      });
    },
    async pull(params) {
      await pull({
        http,
        ...params,
      });
    },
    async status({ fs, dir, gitdir, filepath, force }) {
      console.group("status");
      console.log("getting status");

      console.time("load cache");
      await this.loadCache({ fs, dir });
      console.timeEnd("load cache");

      const result = await status({
        fs,
        dir,
        gitdir,
        filepath,
      });

      console.time("save cache");
      if (force) {
        await this.saveCacheForce({ fs, dir });
      } else {
        await this.saveCache({ fs, dir });
      }
      console.timeEnd("save cache");
      console.groupEnd();

      return result;
    },
    async statusMatrix({
      dir,
      fs,
      gitdir = dir + "/.git",
      ref = "HEAD",
      filepaths = ["."],
      filter = () => true,
      force = false,
    }) {
      console.group("statusMatrix");
      console.log("Status matrix called");
      console.time("statusMatrix");

      console.time("load cache");
      await this.loadCache({ fs, dir });
      console.timeEnd("load cache");

      const ret = await walk({
        fs,
        cache,
        dir,
        gitdir,
        trees: [TREE({ ref }), WORKDIR(), STAGE()],
        map: async function (filepath, [head, workdir, stage]) {
          // Ignore ignored files, but only if they are not already tracked.
          if (!head && !stage && workdir) {
            if (
              await isIgnored({
                fs,
                dir,
                filepath,
              })
            ) {
              return null;
            }
          }
          // match against base paths
          if (!filepaths.some((base) => worthWalking(filepath, base))) {
            return null;
          }
          // Late filter against file names
          if (filter) {
            if (!filter(filepath)) return;
          }

          // For now, just bail on directories
          const headType = head && (await head.type());
          if (headType === "tree" || headType === "special") return;
          if (headType === "commit") return null;

          const workdirType = workdir && (await workdir.type());

          if (workdirType === "special") return;

          const stageType = stage && (await stage.type());
          if (stageType === "commit") return null;
          if (stageType === "special") return;

          // Figure out the oids, using the staged oid for the working dir oid if the stats match.
          const headOid = head ? await head.oid() : undefined;
          const stageOid = stage ? await stage.oid() : undefined;
          // eslint-disable-next-line functional/no-let
          let workdirOid;
          if (!head && workdir && !stage) {
            // We don't actually NEED the sha. Any sha will do
            // TODO: update this logic to handle N trees instead of just 3.
            workdirOid = "42";
          } else if (workdir) {
            workdirOid = (await workdir.oid()) ?? "0x";
          }

          const entry = [undefined, headOid, workdirOid, stageOid];

          const result = entry.map((value) => entry.indexOf(value));
          // eslint-disable-next-line functional/immutable-data
          result.shift(); // remove leading undefined entry
          return [filepath, ...result];
        },
      });

      console.time("save cache");
      if (force) {
        await this.saveCacheForce({ fs, dir });
      } else {
        await this.saveCache({ fs, dir });
      }
      console.timeEnd("save cache");

      console.log(ret);
      console.timeEnd("statusMatrix");
      console.groupEnd();

      return ret;
    },
    // * for @cache
    clearCache(): void {
      Object.getOwnPropertyNames(cache).forEach((prop) => {
        // eslint-disable-next-line functional/immutable-data
        delete cache[prop as keyof typeof cache];
      });
    },
    async removeCache({ fs, dir }): Promise<void> {
      if (cache.dir && resolve(cache.dir) === resolve(dir)) {
        this.clearCache();
      }

      try {
        await fs.unlink(GET_PATH_CACHE_STATUS(dir));
      } catch {}
    },
    async saveCache({ fs, dir }): Promise<void> {
      if (!cache.dir) {
        // if cache object for dir -> save();
        await this.saveCacheForce({ fs, dir });
      }
    },
    // this method for update cache old. Example: after push, pull, add...
    async saveCacheForce({ fs, dir }): Promise<void> {
      await fs.writeFile(
        GET_PATH_CACHE_STATUS(dir),
        cacheToJson(cache),
        "utf8"
      );
    },
    async loadCache({ fs, dir }): Promise<void> {
      if (cache.dir && resolve(cache.dir) !== resolve(dir)) {
        // if cache is other project -> clear()
        this.clearCache();
      }
      if (!cache.dir && (await fs.exists(GET_PATH_CACHE_STATUS(dir)))) {
        // if cache anonymous and cache project not exist -> use cache anonymous -> exit()
        this.clearCache();

        return;
      }

      if (!cache.dir || resolve(cache.dir) !== resolve(dir)) {
        try {
          // eslint-disable-next-line functional/immutable-data
          Object.assign(
            cache,
            jsonToCache(await fs.readFile(GET_PATH_CACHE_STATUS(dir), "utf8")),
            {
              dir: resolve(dir),
            }
          );
        } catch {}
      }
    },
  };
}

expose(callbacks());
