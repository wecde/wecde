import type { Stat } from "capacitor-fs/build/main/Stat";
import { sort } from "fast-sort";
import minimatch from "minimatch";
import fs from "modules/fs";
import { basename, join } from "path-cross";
import { onBeforeUnmount } from "vue";

export type StatItem = {
  readonly stat: Stat;
  readonly fullpath: string;
};

export async function readdirAndStat(
  path: string
): Promise<readonly StatItem[]> {
  return sortFolder(
    await Promise.all(
      (
        await fs.readdir(path)
      )
        .filter((item) => minimatch(item, "!.git"))
        .map(async (item) => {
          return {
            stat: await fs.stat(join(path, item)),
            fullpath: join(path, item),
          };
        })
    )
  );
}

function sortFolder(items: readonly StatItem[]): readonly StatItem[] {
  // eslint-disable-next-line functional/prefer-readonly-type
  const files: StatItem[] = [];
  // eslint-disable-next-line functional/prefer-readonly-type
  const folders: StatItem[] = [];

  items.forEach((file) => {
    if (file.stat.type === "file" || file.stat.type === "symlink") {
      // eslint-disable-next-line functional/immutable-data
      files.push(file);
    } else {
      // eslint-disable-next-line functional/immutable-data
      folders.push(file);
    }
  });

  return [
    ...sort<StatItem>(folders).asc((item) => basename(item.fullpath)),
    ...sort<StatItem>(files).asc((item) => basename(item.fullpath)),
  ];
}

// eslint-disable-next-line functional/functional-parameters
export const registerEvent: typeof fs.on = (...params) => {
  const ev = fs.on(...params);

  onBeforeUnmount(() => void ev());

  return ev;
};
// eslint-disable-next-line functional/functional-parameters
export const registerWatch: typeof fs.watch = (...params) => {
  const watcher = fs.watch(...params);

  return watcher;
};
