import { statusMatrix } from "isomorphic-git";
import { expose } from "workercom";

export type GitStatusMatrixRemoteInterface = typeof statusMatrix;

expose(statusMatrix);
