/* eslint-env worker */
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).window = self;

import { expose } from "comlink";
import git, {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  MessageCallback,
  ProgressCallback,
} from "isomorphic-git-cross";
import http from "isomorphic-git-cross/http/web/index.js";
import fs from "modules/filesystem";

export type GitRemoteInterface = {
  readonly clone: (
    params: {
      readonly dir: string;
      readonly url: string;
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
    },
    onAuth: AuthCallback,
    onAuthFailure: AuthFailureCallback,
    onAuthSuccess: AuthSuccessCallback,
    onMessage: MessageCallback,
    onProgress: ProgressCallback
  ) => Promise<void>;
  readonly listRemotes: (params: {
    readonly dir: string | undefined;
    readonly gitdir?: string | undefined;
  }) => Promise<readonly { readonly remote: string; readonly url: string }[]>;
  readonly listBranches: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly remote?: string | undefined;
  }) => Promise<readonly string[]>;
  readonly listTags: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
  }) => Promise<readonly string[]>;
  readonly checkout: (
    params: {
      readonly dir: string;
      readonly gitdir?: string | undefined;
      readonly ref?: string | undefined;
      // eslint-disable-next-line functional/prefer-readonly-type
      readonly filepaths?: string[] | undefined;
      readonly remote?: string | undefined;
      readonly noCheckout?: boolean | undefined;
      readonly noUpdateHead?: boolean | undefined;
      readonly dryRun?: boolean | undefined;
      readonly force?: boolean | undefined;
    },

    onProgress?: ProgressCallback
  ) => Promise<void>;
  readonly getConfig: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly path: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<any>;
  readonly add: (params: {
    readonly dir: string;
    readonly filepath: string;
  }) => Promise<void>;
  readonly remove: (params: {
    readonly dir: string;
    readonly filepath: string;
  }) => Promise<void>;
  readonly resetIndex: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly filepath: string;
    readonly ref?: string | undefined;
  }) => Promise<void>;
  readonly commit: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly message: string;
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
    readonly dryRun?: boolean | undefined;
    readonly noUpdateBranch?: boolean | undefined;
    readonly ref?: string | undefined;
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly parent?: string[] | undefined;
    readonly tree?: string | undefined;
  }) => Promise<void>;
  readonly init: (params: {
    readonly dir?: string | undefined;
    readonly gitdir?: string | undefined;
    readonly bare?: boolean | undefined;
    readonly defaultBranch?: string | undefined;
  }) => Promise<void>;
  readonly push: (
    params: {
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
    },

    onAuth: AuthCallback,
    onAuthFailure: AuthFailureCallback,
    onAuthSuccess: AuthSuccessCallback,
    onMessage: MessageCallback,
    onProgress: ProgressCallback
  ) => Promise<void>;
  readonly pull: (
    params: {
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
    },

    onAuth: AuthCallback,
    onAuthFailure: AuthFailureCallback,
    onAuthSuccess: AuthSuccessCallback,
    onMessage: MessageCallback,
    onProgress: ProgressCallback
  ) => Promise<void>;
  readonly status: (params: {
    readonly dir: string;
    readonly gitdir?: string | undefined;
    readonly filepath: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly cache?: any;
  }) => Promise<string>;
  readonly statusMatrix: (params: {
    readonly dir: string;
    readonly gitdir?: string | undefined;
    readonly ref?: string | undefined;
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly filepaths?: string[] | undefined;
    readonly filter?: ((arg0: string) => boolean) | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly cache?: any;
  }) => Promise<
    readonly (readonly [string, 0 | 1, 0 | 2 | 1, 0 | 2 | 1 | 3])[]
  >;
};

function callbacks(): GitRemoteInterface {
  return {
    async clone(
      params,
      onAuth,
      onAuthFailure,
      onAuthSuccess,
      onMessage,
      onProgress
    ) {
      await git.clone({
        fs,
        http,
        ...params,
        onAuth,
        onAuthFailure,
        onAuthSuccess,
        onMessage,
        onProgress,
      });
    },
    async listRemotes(params) {
      return await git.listRemotes({
        fs,
        ...params,
      });
    },
    async listBranches(params) {
      return await git.listBranches({
        fs,
        ...params,
      });
    },
    async listTags(params) {
      return await git.listTags({
        fs,
        ...params,
      });
    },
    async checkout(params, onProgress) {
      return await git.checkout({
        fs,
        ...params,
        onProgress,
      });
    },
    async getConfig(params) {
      return await git.getConfig({
        fs,
        ...params,
      });
    },
    async add(params) {
      await git.add({
        fs,
        ...params,
      });
    },
    async remove(params) {
      await git.add({
        fs,
        ...params,
      });
    },
    async resetIndex(params) {
      await git.resetIndex({
        fs,
        ...params,
      });
    },
    async commit(params) {
      await git.commit({
        fs,
        ...params,
      });
    },
    async init(params) {
      await git.init({
        fs,
        ...params,
      });
    },
    async push(
      params,
      onAuth,
      onAuthFailure,
      onAuthSuccess,
      onMessage,
      onProgress
    ) {
      await git.push({
        fs,
        http,
        ...params,
        onAuth,
        onAuthFailure,
        onAuthSuccess,
        onMessage,
        onProgress,
      });
    },
    async pull(
      params,
      onAuth,
      onAuthFailure,
      onAuthSuccess,
      onMessage,
      onProgress
    ) {
      await git.pull({
        fs,
        http,
        ...params,
        onAuth,
        onAuthFailure,
        onAuthSuccess,
        onMessage,
        onProgress,
      });
    },
    async status(params) {
      return await git.status({
        fs,
        ...params,
      });
    },
    async statusMatrix(params) {
      console.log("git-worker: statusMatrix called");
      return await git
        .statusMatrix({
          fs,
          ...params,
        })
        .then((e) => {
          console.log("git-worker: statusMatrix ended");

          return e;
        });
    },
  };
}

expose(callbacks());
