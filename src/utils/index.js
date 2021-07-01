import { extname as _extname } from "path";

export function extname(path) {
  return _extname(path).replace(/^\./g, "");
}
