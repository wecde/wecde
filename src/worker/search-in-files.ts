import Worker from "worker-loader?publicPath=/!./search-in-files.worker";
import { releaseProxy, Remote, wrap } from "workercom";

import type { SearchInFileRemoteInterface } from "./search-in-files.worker";

// eslint-disable-next-line functional/no-let
let worker = new Worker();
// eslint-disable-next-line functional/no-let
let workerWrap = wrap<SearchInFileRemoteInterface>(worker);

export function useSearchInFiles(): Remote<SearchInFileRemoteInterface> {
  return workerWrap;
}

export function refreshSearchInFiles(): void {
  console.info("worker-search-in-files: refresh");
  worker.terminate();
  workerWrap[releaseProxy]();
  worker = new Worker();
  workerWrap = wrap<SearchInFileRemoteInterface>(worker);
}
