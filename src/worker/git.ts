import Worker from "worker-loader!./git.worker";
import { releaseProxy, Remote, wrap } from "workercom";

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
  workerWrap[releaseProxy]();
  worker = new Worker();
  workerWrap = wrap<GitRemoteInterface>(worker);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).gitWorker = workerWrap;
