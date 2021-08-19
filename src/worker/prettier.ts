import { Remote, wrap } from "comlink";
import Worker from "worker-loader!./prettier.worker";

import type { PrettierRemoteInterface } from "./prettier.worker";

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
  worker = new Worker();
  workerWrap = wrap<PrettierRemoteInterface>(worker);
}
