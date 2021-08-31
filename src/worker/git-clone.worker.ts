import type {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  CallbackFsClient,
  MessageCallback,
  ProgressCallback,
  PromiseFsClient,
} from "isomorphic-git";
import { clone } from "isomorphic-git";
import http from "isomorphic-git/http/web";
import { expose } from "workercom";

export type GitCloneRemoteInterface = (config: {
  readonly fs: CallbackFsClient | PromiseFsClient;
  readonly onProgress?: ProgressCallback;
  readonly onMessage?: MessageCallback;
  readonly onAuth?: AuthCallback;
  readonly onAuthFailure?: AuthFailureCallback;
  readonly onAuthSuccess?: AuthSuccessCallback;
  readonly dir: string;
  readonly gitdir?: string;
  readonly url: string;
  readonly corsProxy?: string;
  readonly ref?: string;
  readonly singleBranch?: boolean;
  readonly noCheckout?: boolean;
  readonly noTags?: boolean;
  readonly remote?: string;
  readonly depth?: number;
  readonly since?: Date;
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly exclude?: string[];
  readonly relative?: boolean;
  readonly headers?: { readonly [x: string]: string };
}) => Promise<void>;

function methods(): GitCloneRemoteInterface {
  return (config) =>
    clone({
      http,
      ...config,
    });
}

expose(methods());
