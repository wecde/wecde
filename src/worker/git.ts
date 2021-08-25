import fs from "src/modules/fs";
import Worker from "worker-loader?publicPath=/!./git.worker";
import { releaseProxy, Remote, wrap } from "workercom";

import type { GitRemoteInterface } from "./git.worker";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<GitRemoteInterface>(worker);

void workerWrap.setFs(fs);

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
  void workerWrap.setFs(fs);
}
