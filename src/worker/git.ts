import { Remote, wrap } from "comlink";
import Worker from "worker-loader!./git.worker";

import type { GitRemoteInterface } from "./git.worker";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<GitRemoteInterface>(worker);

export function useGitWorker(): Remote<GitRemoteInterface> {
  return workerWrap;
}
export function useGitWorkerConstructor(): Worker {
  return worker;
}

export function refreshGitWorker(): void {
  console.info("worker-git: refresh");
  worker.terminate();
  worker = new Worker();
  workerWrap = wrap<GitRemoteInterface>(worker);
}
