import FS from "capacitor-fs";
import type { Stat } from "capacitor-fs/build/main/Stat";
import { sort } from "fast-sort";
import minimatch from "minimatch";
import { basename, join } from "path-cross";
import "src/worker/git";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

const fs = new FS({
  rootDir: PUBLIC_STORAGE_APPLICATION,
  base64Alway: true,
});

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

export default fs;
