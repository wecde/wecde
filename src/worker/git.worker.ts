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
} from "isomorphic-git";
import http from "isomorphic-git/http/web/index.js";
import fs from "modules/fs";
import { expose } from "workercom";

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
const cache = {};

setInterval(() => {
  [
    ...Object.getOwnPropertyNames(cache),
    ...Object.getOwnPropertySymbols(cache),
  ].forEach((prop) => {
    // eslint-disable-next-line functional/immutable-data
    delete cache[prop as keyof typeof cache];
  });
}, 30 * 60 * 1000);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).cache = cache;
// eslint-disable-next-line functional/no-mixed-type
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
    readonly relative?: boolean | undefined;
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
  readonly status: typeof status;
  readonly statusMatrix: (options: {
    readonly fs: typeof fs;
    readonly dir: string;
    readonly gitdir?: string;
    readonly ref?: string;
    readonly filepaths?: readonly string[];
    readonly filter?: (filepath: string) => boolean;
  }) => Promise<readonly (readonly [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2])[]>;
  readonly log: (msg: string) => Promise<void>;
  readonly setFs: (_fs: typeof fs) => void;
  // eslint-disable-next-line functional/prefer-readonly-type
  fs?: typeof fs;
};

function callbacks(): GitRemoteInterface {
  return {
    fs,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setFs(_fs) {
      // this.fs = fs;
    },
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
    status,
    async statusMatrix({
      dir,
      // fs,
      gitdir = dir + "/.git",
      ref = "HEAD",
      filepaths = ["."],
      filter = () => true,
    }) {
      console.group("statusMatrix");
      console.log("Status matrix called");
      console.time("statusMatrix");
      const ret = await walk({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fs: this.fs as any,
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

      console.log(ret);
      console.timeEnd("statusMatrix");
      console.groupEnd();

      return ret;
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async log(cb) {
      console.log(cb);
    },
  };
}

expose(callbacks());
