import { store } from "src/store";
import { createTimeoutBy } from "src/utils";

const cache = Object.create(null);

export default cache;

export function clear(): void {
  // eslint-disable-next-line functional/no-loop-statement
  for (const key in cache) {
    // eslint-disable-next-line functional/immutable-data
    delete cache[key];
  }
}

store.watch(
  () => store.state.editor.project,
  () => {
    void clear();
  }
);

createTimeoutBy(
  "clear cache git status",
  () => {
    void clear();
  },
  5 * 60 * 1000
);
