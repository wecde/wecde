import Worker from "worker-loader?publicPath=/!./git-statusMatrix.worker";
import { releaseProxy, Remote, wrap } from "workercom";

import type { GitStatusMatrixRemoteInterface } from "./git-statusMatrix.worker";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<GitStatusMatrixRemoteInterface>(worker);

export function useGitStatusMatrix(): Remote<GitStatusMatrixRemoteInterface> {
  return workerWrap;
}

export function refreshGitStatusMatrixWorker(): void {
  console.info("worker-git-statusMatrix: refresh");
  worker.terminate();
  workerWrap[releaseProxy]();
  worker = new Worker();
  workerWrap = wrap<GitStatusMatrixRemoteInterface>(worker);
}
