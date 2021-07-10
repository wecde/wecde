import { Filesystem, Directory, StatResult } from "@capacitor/filesystem";
import { alwayBase64 } from "@/utils";
import { arrayBufferToBase64 } from "../utils";
import { join } from "path";
import { sort } from "fast-sort";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

export async function readdir(
  path: string,
  directory: Directory = Directory.Documents
): Promise<string[]> {
  return (
    await Filesystem.readdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
    })
  ).files;
}

export async function mkdir(
  path: string,
  directory: Directory = Directory.Documents
): Promise<void> {
  try {
    await Filesystem.mkdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {}
}

export async function rmdir(
  path: string,
  directory: Directory = Directory.Documents
): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {}
}
/**
 *
 * todo: not support base64
 */
export async function writeFile(
  path: string,
  data: ArrayBuffer | Uint8Array | Blob | string,
  directory: Directory = Directory.Documents
): Promise<void> {
  if (data instanceof ArrayBuffer) {
    data = arrayBufferToBase64(data);
  } else if (data instanceof Uint8Array) {
    data = Buffer.from(data).toString("base64");
  } else if (data instanceof Blob) {
    data = arrayBufferToBase64(await data.arrayBuffer());
  } else {
    data = btoa(data);
  }

  try {
    await Filesystem.writeFile({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
      data,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {
    try {
      await Filesystem.writeFile({
        path: join(PUBLIC_STORAGE_APPLICATION, path),
        directory,
        data,
        recursive: false,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export async function readFile(
  path: string,
  directory: Directory = Directory.Documents
): Promise<string> {
  const { data } = await Filesystem.readFile({
    path: join(PUBLIC_STORAGE_APPLICATION, path),
    directory,
  });

  return alwayBase64(data);
}

export async function unlink(
  path: string,
  directory: Directory = Directory.Documents
): Promise<void> {
  const { type } = await Filesystem.stat({
    path: join(PUBLIC_STORAGE_APPLICATION, path),
    directory,
  });

  if (type === "directory") {
    await rmdir(path);
  } else {
    await Filesystem.deleteFile({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
    });
  }
}

export async function rename(
  from: string,
  to: string,
  directory: Directory = Directory.Documents,
  toDirectory: Directory = Directory.Documents
): Promise<void> {
  /// fix error
  const { startsWith } = String.prototype;
  String.prototype.startsWith = () => false;
  await Filesystem.rename({
    from: join(PUBLIC_STORAGE_APPLICATION, from),
    to: join(PUBLIC_STORAGE_APPLICATION, to),
    directory,
    toDirectory,
  });
  String.prototype.startsWith = startsWith;
}

export async function copy(
  from: string,
  to: string,
  directory: Directory = Directory.Documents,
  toDirectory: Directory = Directory.Documents
): Promise<void> {
  await Filesystem.copy({
    from: join(PUBLIC_STORAGE_APPLICATION, from),
    to: join(PUBLIC_STORAGE_APPLICATION, to),
    directory,
    toDirectory,
  });
}

export async function stat(
  path: string,
  directory: Directory = Directory.Documents
): Promise<StatResult> {
  return await Filesystem.stat({
    path: join(PUBLIC_STORAGE_APPLICATION, path),
    directory,
  });
}

function filterExclude(
  files: string[],
  exclude: Array<string | RegExp> = []
): string[] {
  return files.filter((name) => {
    return (
      exclude.some((item) => {
        if (item instanceof RegExp) {
          return item.test(name);
        }

        return item === name;
      }) === false
    );
  });
}
export interface ReaddirStatItem {
  name: string;
  directory: string;
  dirname: string;
  stat: StatResult;
  fullpath: string;
}
export async function readdirStat(
  path: string,
  directory: Directory = Directory.Documents,
  exclude: Array<string | RegExp> = []
): Promise<ReaddirStatItem[]> {
  return sortFolder(
    await Promise.all(
      filterExclude(await readdir(path, directory), exclude).map(
        async (name) => {
          return {
            name,
            directory,
            dirname: path,
            fullpath: join(path, name),
            stat: await stat(join(path, name), directory),
          };
        }
      )
    )
  );
}

export function sortFolder(items: ReaddirStatItem[]): ReaddirStatItem[] {
  const files: ReaddirStatItem[] = [];
  const folders: ReaddirStatItem[] = [];

  items.forEach((file) => {
    if (file.stat.type === "file" || file.stat.type === "symlink") {
      files.push(file);
    } else {
      folders.push(file);
    }
  });

  return [
    ...sort<ReaddirStatItem>(folders).asc((item) => item.name),
    ...sort<ReaddirStatItem>(files).asc((item) => item.name),
  ];
}

export interface ReadFilesFolderItem {
  key: string;
  value: ReaddirStatItem & {
    data?: string;
  };
}
export async function readFilesFolder(
  path: string,
  directory: Directory = Directory.Documents,
  exclude: Array<string | RegExp> = []
): Promise<ReadFilesFolderItem[]> {
  const thisChildren: ReadFilesFolderItem[] = [];

  await Promise.all(
    filterExclude(await readdir(path), exclude).map(async (name) => {
      const pathToFile = join(path, name);
      const thisStat = await stat(pathToFile, directory);
      let data;

      if (thisStat.type === "file" || thisStat.type === "symlink") {
        data = await readFile(pathToFile, directory);
      }

      thisChildren.push(
        {
          key: pathToFile,
          value: {
            name,
            directory,
            dirname: path,
            stat: thisStat,
            data,
            fullpath: pathToFile,
          },
        },
        ...(thisStat.type === "directory"
          ? await readFilesFolder(pathToFile, directory)
          : [])
      );
    })
  );

  return thisChildren;
}

export async function requestPermissions(): Promise<void> {
  if ((await Filesystem.checkPermissions()).publicStorage !== "granted") {
    await Filesystem.requestPermissions();
  }
}

export async function getUri(
  path: string,
  directory: Directory = Directory.Documents
): Promise<string> {
  return decodeURIComponent(
    (
      await Filesystem.getUri({
        path: join(PUBLIC_STORAGE_APPLICATION, path),
        directory,
      })
    ).uri
  ).replace(/^[a-z]+:\/\//, "");
}
