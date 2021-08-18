// import MagicPortal from "magic-portal/dist/index.js";
import { proxy, wrap } from "comlink";
import * as helpers from "src/helpers/git";
import GitWorker from "worker-loader!./git.worker";

import type { GitRemoteInterface } from "./git.worker";

const worker = wrap<GitRemoteInterface>(new GitWorker());

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).gitWorker = worker;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).helpers = helpers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).proxy = proxy;

export default worker;
