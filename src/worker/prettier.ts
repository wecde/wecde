import { releaseProxy, Remote, wrap } from "workercom";

import type { PrettierRemoteInterface } from "./prettier.worker";
import Worker from "./prettier.worker.ts";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<PrettierRemoteInterface>(worker);

export function usePrettierWorker(): Remote<PrettierRemoteInterface> {
  return workerWrap;
}
export function usePrettierConstructor(): Worker {
  return worker;
}

export function refreshPrettierWorker(): void {
  console.info("worker-prettier: refresh");
  worker.terminate();
  workerWrap[releaseProxy]();
  worker = new Worker();
  workerWrap = wrap<PrettierRemoteInterface>(worker);
}
