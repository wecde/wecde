import { store } from "src/store";

const cache = Object.create(null);

export default cache;

export function clear(): void {
  // eslint-disable-next-line functional/no-loop-statement
  for (const key in cache) {
    // eslint-disable-next-line functional/immutable-data
    delete cache[key];
  }
  // eslint-disable-next-line functional/immutable-data
  Object.getOwnPropertySymbols(cache).forEach((key) => delete cache[key]);
}

store.watch(
  () => store.state.editor.project,
  () => {
    void clear();
  }
);

setInterval(() => void clear(), 5 * 60 * 1000);
