import Worker from "worker-loader?publicPath=/!./git-clone.worker";
import { releaseProxy, Remote, wrap } from "workercom";

import type { GitCloneRemoteInterface } from "./git-clone.worker";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<GitCloneRemoteInterface>(worker);

export function useGitCloneWorker(): Remote<GitCloneRemoteInterface> {
  return workerWrap;
}

export function refreshPrettierWorker(): void {
  console.info("worker-git-clone: refresh");
  worker.terminate();
  workerWrap[releaseProxy]();
  worker = new Worker();
  workerWrap = wrap<GitCloneRemoteInterface>(worker);
}
