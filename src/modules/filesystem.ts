/* eslint-disable functional/immutable-data */

import { Directory, Filesystem } from "@capacitor/filesystem";
import type { StatResult } from "@capacitor/filesystem";
import { encode } from "base-64";
import escapeStringRegexp from "escape-string-regexp";
import { sort } from "fast-sort";
import { basename, join } from "path-cross";

import { alwayBase64 } from "../utils";
import { arrayBufferToBase64 } from "../utils";

import eventBus from "./event-bus";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

async function fixStartsWidth<T>(callback: { (): Promise<T> }): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { startsWith } = String.prototype;
  String.prototype.startsWith = () => false;
  const result = await callback();
  String.prototype.startsWith = startsWith;
  return result;
}

export function readdir(path: string): Promise<readonly string[]> {
  return new Promise((resolve, reject) => {
    Filesystem.readdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),
      directory: Directory.Documents,
    })
      .then(({ files }) => resolve(files))
      .catch(() => void reject());
  });
}

export async function mkdir(path: string): Promise<void> {
  try {
    await Filesystem.mkdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),

      directory: Directory.Documents,
      recursive: true,
    });
    eventBus.emit("create:dir", path);
  } catch {}
}

export async function rmdir(path: string): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),

      directory: Directory.Documents,
      recursive: true,
    });
    eventBus.emit("remove:dir", path);
  } catch {}
}
/**
 *
 * todo: not support base64
 */
export async function writeFile(
  path: string,
  data: ArrayBuffer | Uint8Array | Blob | string
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

      directory: Directory.Documents,
      data,
      recursive: true,
    });

    if (!!data) {
      eventBus.emit("write:file", path);
    } else {
      eventBus.emit("create:file", path);
    }
  } catch {
    try {
      await Filesystem.writeFile({
        path: join(PUBLIC_STORAGE_APPLICATION, path),

        directory: Directory.Documents,
        data,
        recursive: false,
      });

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

export async function readFile(path: string): Promise<string> {
  const { data } = await Filesystem.readFile({
    path: join(PUBLIC_STORAGE_APPLICATION, path),

    directory: Directory.Documents,
  });

  return alwayBase64(data);
}

export async function unlink(path: string): Promise<void> {
  const { type } = await Filesystem.stat({
    path: join(PUBLIC_STORAGE_APPLICATION, path),

    directory: Directory.Documents,
  });

  if (type === "directory") {
    await rmdir(path);
  } else {
    await Filesystem.deleteFile({
      path: join(PUBLIC_STORAGE_APPLICATION, path),

      directory: Directory.Documents,
    });

    eventBus.emit("remove:file", path);
  }
}

export async function rename(from: string, to: string): Promise<void> {
  /// fix error
  await fixStartsWidth<void>(async () => {
    await Filesystem.rename({
      from: join(PUBLIC_STORAGE_APPLICATION, from),
      to: join(PUBLIC_STORAGE_APPLICATION, to),

      directory: Directory.Documents,

      toDirectory: Directory.Documents,
    });

    async function nosync() {
      if ((await stat(to)).type === "directory") {
        eventBus.emit("move:dir", to, from);
      } else {
        eventBus.emit("move:file", to, from);
      }
    }
    void nosync();
  });
}

export async function copy(from: string, to: string): Promise<void> {
  await fixStartsWidth<void>(async () => {
    await Filesystem.copy({
      from: join(PUBLIC_STORAGE_APPLICATION, from),
      to: join(PUBLIC_STORAGE_APPLICATION, to),

      directory: Directory.Documents,

      toDirectory: Directory.Documents,
    });

    async function nosync() {
      if ((await stat(to)).type === "directory") {
        eventBus.emit("move:dir", to, from);
      } else {
        eventBus.emit("move:file", to, from);
      }
    }
    void nosync();
  });
}

export function stat(path: string): Promise<StatResult> {
  return Filesystem.stat({
    path: join(PUBLIC_STORAGE_APPLICATION, path),
    directory: Directory.Documents,
  });
}

function exists(
  regexps: ReadonlyArray<string | RegExp> = [],
  uri: string
): boolean {
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
  files: readonly string[],
  exclude: ReadonlyArray<string | RegExp> = [],
  include: ReadonlyArray<string | RegExp> = [],
  dirname = ""
): readonly string[] {
  return files.filter((name) => {
    return (
      !exists(exclude, join(dirname.replace(/^projects\//, ""), name)) &&
      (include.length === 0 ||
        exists(include, join(dirname.replace(/^projects\//, ""), name)))
    );
  });
}
export type StatItem = {
  readonly stat: StatResult;
  readonly fullpath: string;
};
export async function readdirStat(
  path: string,
  exclude: ReadonlyArray<string | RegExp> = []
): Promise<readonly StatItem[]> {
  return sortFolder(
    await Promise.all(
      filterExclude(await readdir(path), exclude).map(async (name) => {
        return {
          name,
          dirname: path,
          fullpath: join(path, name),

          stat: await stat(join(path, name)),
        };
      })
    )
  );
}

export function sortFolder(items: readonly StatItem[]): readonly StatItem[] {
  // eslint-disable-next-line functional/prefer-readonly-type
  const files: StatItem[] = [];
  // eslint-disable-next-line functional/prefer-readonly-type
  const folders: StatItem[] = [];

  items.forEach((file) => {
    if (file.stat.type === "file" || file.stat.type === "symlink") {
      files.push(file);
    } else {
      folders.push(file);
    }
  });

  return [
    ...sort<StatItem>(folders).asc((item) => basename(item.fullpath)),
    ...sort<StatItem>(files).asc((item) => basename(item.fullpath)),
  ];
}

export type ReadFilesFolderItem = {
  readonly key: string;
  readonly value: StatItem & {
    readonly data?: string;
  };
};
export async function readFilesFolder(
  path: string,
  exclude: ReadonlyArray<string | RegExp> = []
): Promise<readonly ReadFilesFolderItem[]> {
  // eslint-disable-next-line functional/prefer-readonly-type
  const thisChildren: ReadFilesFolderItem[] = [];

  await Promise.all(
    filterExclude(await readdir(path), exclude).map(async (name) => {
      const pathToFile = join(path, name);
      const thisStat: StatResult = await stat(pathToFile);
      // eslint-disable-next-line functional/no-let
      let data;

      if (thisStat.type === "file" || thisStat.type === "symlink") {
        // eslint-disable-next-line prefer-const
        data = await readFile(pathToFile);
      }

      thisChildren.push(
        {
          key: pathToFile,
          value: {
            stat: thisStat,
            data,
            fullpath: pathToFile,
          },
        },
        ...(thisStat.type === "directory"
          ? await readFilesFolder(pathToFile)
          : [])
      );
    })
  );

  return thisChildren;
}

export async function getUri(path: string): Promise<string> {
  return decodeURIComponent(
    (
      await Filesystem.getUri({
        path: join(PUBLIC_STORAGE_APPLICATION, path),
        directory: Directory.Documents,
      })
    ).uri
  ).replace(/^[a-z]+:\/\//, "");
}

export async function foreach(
  path: string,
  exclude: ReadonlyArray<string | RegExp> = [],
  include: ReadonlyArray<string | RegExp> = [],
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
