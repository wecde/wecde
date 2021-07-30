import { Filesystem, Directory, StatResult } from "@capacitor/filesystem";
import { alwayBase64 } from "@/utils";
import { arrayBufferToBase64 } from "../utils";
import { join, basename } from "path";
import { sort } from "fast-sort";
import escapeStringRegexp from "escape-string-regexp";
import eventBus from "./event-bus";
import { encode } from "base-64";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

async function fixStartsWidth<T>(callback: { (): Promise<T> }): Promise<T> {
  const { startsWith } = String.prototype;
  String.prototype.startsWith = () => false;
  const result = await callback();
  String.prototype.startsWith = startsWith;
  return result;
}

export function readdir(
  path: string,
  directory: Directory = Directory.Documents
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Filesystem.readdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory,
    })
      .then(({ files }) => resolve(files))
      .catch(() => void reject());
  });
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
    eventBus.emit("create:dir", path);
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
    eventBus.emit("remove:dir", path);
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
    data = encode(data);
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
      eventBus.emit("write:file", path);
    } else {
      eventBus.emit("create:file", path);
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
        eventBus.emit("write:file", path);
      } else {
        eventBus.emit("create:file", path);
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

    eventBus.emit("remove:file", path);
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

    eventBus.emit("move", from, to);
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

    eventBus.emit("copy", from, to);
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
      return new RegExp(`${escapeStringRegexp(item)}(?:\\/|$)`).test(uri);
    }

    return new RegExp(`(?:\\/|^)${escapeStringRegexp(item)}(?:\\/|$)`).test(
      uri
    );
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
      !exists(exclude, join(dirname.replace(/^projects\//, ""), name)) &&
      (include.length === 0 ||
        exists(include, join(dirname.replace(/^projects\//, ""), name)))
    );
  });
}
export interface ReaddirStatItem {
  directory: string;
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
    ...sort<ReaddirStatItem>(folders).asc((item) => basename(item.fullpath)),
    ...sort<ReaddirStatItem>(files).asc((item) => basename(item.fullpath)),
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
            directory,
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
    (dirname: string, name: string): Promise<void>;
  },
  pathParentMatch = ""
): Promise<void> {
  await Promise.all(
    (
      await readdir(path)
    ).map(async (item) => {
      // check is continue

      if (exclude.length > 0) {
        if (exists(exclude, join(pathParentMatch, item)) === true) {
          return void 0;
        }
      }

      if ((await stat(join(path, item))).type === "directory") {
        await foreach(
          join(path, item),
          exclude,
          include,
          callback,
          join(pathParentMatch, item)
        );
      } else {
        if (include.length > 0) {
          if (exists(include, join(pathParentMatch, item)) === false) {
            return void 0;
          }
        }
        await callback(path, item);
      }
    })
  );
}
