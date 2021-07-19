import { Filesystem, Directory, StatResult } from "@capacitor/filesystem";
import { alwayBase64 } from "@/utils";
import { arrayBufferToBase64 } from "../utils";
import { join, basename, resolve } from "path";
import { sort } from "fast-sort";
import escapeStringRegexp from "escape-string-regexp";
import eventBus from "./event-bus";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

async function fixStartsWidth<T>(callback: { (): Promise<T> }): Promise<T> {
  const { startsWith } = String.prototype;
  String.prototype.startsWith = () => false;
  const result = await callback();
  String.prototype.startsWith = startsWith;
  return result;
}

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
    eventBus.emit("create:dir", resolve(path));
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
    eventBus.emit("remove:dir", resolve(path));
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

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!data) {
      eventBus.emit("write:file", resolve(path));
    } else {
      eventBus.emit("create:file", resolve(path));
    }
    // eslint-disable-next-line no-empty
  } catch {
    try {
      await Filesystem.writeFile({
        path: join(PUBLIC_STORAGE_APPLICATION, path),
        directory,
        data,
        recursive: false,
      });

      // eslint-disable-next-line no-extra-boolean-cast
      if (!!data) {
        eventBus.emit("write:file", resolve(path));
      } else {
        eventBus.emit("create:file", resolve(path));
      }
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

    eventBus.emit("remove:file", resolve(path));
  }
}

export async function rename(
  from: string,
  to: string,
  directory: Directory = Directory.Documents,
  toDirectory: Directory = Directory.Documents
): Promise<void> {
  /// fix error
  await fixStartsWidth<void>(async () => {
    await Filesystem.rename({
      from: join(PUBLIC_STORAGE_APPLICATION, from),
      to: join(PUBLIC_STORAGE_APPLICATION, to),
      directory,
      toDirectory,
    });

    eventBus.emit("move", resolve(from), resolve(to));
  });
}

export async function copy(
  from: string,
  to: string,
  directory: Directory = Directory.Documents,
  toDirectory: Directory = Directory.Documents
): Promise<void> {
  await fixStartsWidth<void>(async () => {
    await Filesystem.copy({
      from: join(PUBLIC_STORAGE_APPLICATION, from),
      to: join(PUBLIC_STORAGE_APPLICATION, to),
      directory,
      toDirectory,
    });

    eventBus.emit("copy", resolve(from), resolve(to));
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

function exists(regexps: Array<string | RegExp> = [], uri: string): boolean {
  return regexps.some((item) => {
    if (item instanceof RegExp) {
      return !!item.test(uri);
    }

    if (item.startsWith("^")) {
      return item.replace("^", "") === basename(uri);
    }

    if (item.startsWith(".")) {
      return new RegExp(`${escapeStringRegexp(item)}(?:\\/|\\0$)`).test(uri);
    }

    return new RegExp(
      `(?:\\/|^\\\0)${escapeStringRegexp(item)}(?:\\/|\\\0$)`
    ).test(uri);
  });
}
function filterExclude(
  files: string[],
  exclude: Array<string | RegExp> = [],
  include: Array<string | RegExp> = [],
  dirname = ""
): string[] {
  return files.filter((name) => {
    return (
      !exists(exclude, join(dirname, name)) &&
      (include.length === 0 || exists(include, join(dirname, name)))
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

export async function foreach(
  path: string,
  exclude: Array<string | RegExp> = [],
  include: Array<string | RegExp> = [],
  callback: {
    (dirname: string, name: string): void;
  }
): Promise<void> {
  await Promise.all(
    filterExclude(await readdir(path), exclude, include, path).map(
      async (item) => {
        if ((await stat(join(path, item))).type === "directory") {
          await foreach(join(path, item), exclude, include, callback);
        } else {
          await callback(path, item);
        }
      }
    )
  );
}
