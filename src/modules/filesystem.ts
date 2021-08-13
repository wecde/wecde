import { Directory, Filesystem } from "@capacitor/filesystem";
import type { StatResult } from "@capacitor/filesystem";
import { encode } from "base-64";
import escapeStringRegexp from "escape-string-regexp";
import { sort } from "fast-sort";
import { Ignore } from "ignore";
import { basename, join, relative } from "path-cross";
import {
  alwayBase64,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  pathEquals,
  pathEqualsOrParent,
  rawText,
} from "src/utils";
import { onBeforeUnmount } from "vue";

const PUBLIC_STORAGE_APPLICATION = "Shin Code Editor";

export type StatItem = {
  readonly stat: StatResult;
  readonly fullpath: string;
};
export type ReadFilesFolderItem = {
  readonly key: string;
  readonly value: StatItem & {
    readonly data?: string;
  };
};

async function fixStartsWidth<T>(callback: { (): Promise<T> }): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { startsWith } = String.prototype;
  // eslint-disable-next-line functional/immutable-data
  String.prototype.startsWith = () => false;
  const result = await callback();
  // eslint-disable-next-line functional/immutable-data
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
    watcher.emit("create:dir", path);
  } catch {}
}

export async function rmdir(path: string): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: join(PUBLIC_STORAGE_APPLICATION, path),

      directory: Directory.Documents,
      recursive: true,
    });
    watcher.emit("remove:dir", path);
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
  const realData = data;
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

    watcher.emit("write:file", path, realData as string);
  } catch {
    try {
      await Filesystem.writeFile({
        path: join(PUBLIC_STORAGE_APPLICATION, path),

        directory: Directory.Documents,
        data,
        recursive: false,
      });

      watcher.emit("write:file", path, realData as string);
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

    watcher.emit("remove:file", path);
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
        watcher.emit("move:dir", to, from);
      } else {
        watcher.emit("move:file", to, from);
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
        watcher.emit("move:dir", to, from);
      } else {
        watcher.emit("move:file", to, from);
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

      // eslint-disable-next-line functional/immutable-data
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

export async function listFiles(
  dir: string,
  ig: Ignore,
  dirname: string
): Promise<readonly string[]> {
  const files = ig
    .filter(
      (await readdir(dir)).map((item) => join(relative(dirname, dir), item))
    )
    .map((item) => {
      return relative(relative(dirname, dir), item);
    });

  return (
    await Promise.all(
      files.map(async (item) => {
        item = join(dir, item);

        if ((await stat(item)).type === "directory") {
          return await listFiles(item, ig, dirname);
        } else {
          return item;
        }
      })
    )
  ).flat(2);
}

type Events =
  | "create:dir"
  | "remove:file"
  | "remove:dir"
  | "write:file"
  | "move:file"
  | "move:dir"
  | "copy:file"
  | "copy:dir";
type Callback<Events> = {
  (type: Events, ...params: readonly string[]): void;
};

export const watcher = new (class Watcher {
  // eslint-disable-next-line functional/prefer-readonly-type
  private readonly store: Map<Events, readonly Callback<Events>[]> = new Map();
  on(
    name: Events | readonly Events[],
    callback: Callback<Events>
  ): {
    (): void;
  } {
    if (Array.isArray(name) === false) {
      name = [name as Events];
    }

    (name as readonly Events[]).forEach((item: Events) => {
      if (this.store.has(item) === false) {
        this.store.set(item, [callback]);
      } else {
        this.store.set(item, [...(this.store.get(item) || []), callback]);
      }
    });

    return () => {
      this.off(name, callback);
    };
  }
  off(name: Events | readonly Events[], callback: Callback<Events>): void {
    if (Array.isArray(name) === false) {
      name = [name as Events];
    }

    (name as readonly Events[]).forEach((item) => {
      if (this.store.has(item)) {
        const functions = this.store
          .get(item)
          ?.filter((item) => item !== callback);

        if (functions) {
          this.store.set(item, functions);
        }
      }
    });
  }
  // eslint-disable-next-line functional/functional-parameters
  public emit(name: Events, ...params: readonly string[]): void {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `fs-watcher: "${name as unknown as string}" from "${params[0]}"`
      );
    }
    this.store.get(name)?.forEach((callback) => void callback(name, ...params));
  }
  public watch(
    name: Events | readonly Events[],
    fullpath:
      | string
      | {
          (): string;
        }
      | false,
    callback: Callback<Events>,
    realpath = false
  ): {
    (): void
  } {
    const handler: Callback<Events> = (
      type: Events,
      // eslint-disable-next-line functional/functional-parameters
      ...params: readonly string[]
    ): void => {
      if (
        fullpath === false ||
        (realpath
          ? pathEquals(
              fullpath instanceof Function ? fullpath() : fullpath,
              params[0]
            )
          : pathEqualsOrParent(
              fullpath instanceof Function ? fullpath() : fullpath,
              params[0]
            ))
      ) {
        callback(type, ...params);
      }
    };

    const watcher = this.on(name, handler);
    onBeforeUnmount(() => void watcher());

    return watcher;
  }
})();

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Fs {
  function Err(name: string) {
    return class extends Error {
      public readonly code: string = name;

      constructor(err: string) {
        super(err);
        if (this.message) {
          this.message = name + ": " + this.message;
        } else {
          this.message = name;
        }
      }
    };
  }

  // const EEXIST = Err("EEXIST");
  const ENOENT = Err("ENOENT");
  // const ENOTDIR = Err("ENOTDIR");
  // const ENOTEMPTY = Err("ENOTEMPTY");
  // const ETIMEDOUT = Err("ETIMEDOUT");

  class Stat {
    public readonly type: string;
    public readonly mode = 16822;
    public readonly size: number;
    public readonly ino = 2814749767351612;
    public readonly mtimeMs: number;
    public readonly ctimeMs: number;
    public readonly uid = 1;
    public readonly gid = 1;
    public readonly dev = 1761345728;

    constructor(stats: StatResult) {
      this.type = stats.type;
      this.size = stats.size;
      this.mtimeMs = stats.mtime;
      this.ctimeMs = stats.ctime || stats.mtime;
    }
    isFile(): boolean {
      return this.type === "file";
    }
    isDirectory(): boolean {
      return this.type === "directory";
    }
    isSymbolicLink(): boolean {
      return this.type === "symlink";
    }
  }

  export const fs = {
    promises: {
      readFile(
        path: string,
        { encoding }: { readonly encoding?: "utf8" } = {}
      ): Promise<ArrayBuffer | string> {
        return new Promise((resolve, reject) => {
          readFile(path)
            .then((base64) => {
              if (encoding === "utf8") {
                resolve(rawText(base64));
              }

              resolve(base64ToArrayBuffer(base64));
            })
            .catch(() => {
              reject(new ENOENT(path));
            });
        });
      },

      writeFile(
        path: string,
        data: ArrayBuffer | Uint8Array | Blob | string
      ): Promise<void> {
        return new Promise((resolve, reject) => {
          writeFile(path, data)
            .then((st) => {
              resolve(st);
            })
            .catch((err) => {
              console.log(err);
              reject();
            });
        });
      },
      mkdir(path: string): Promise<void> {
        return mkdir(path);
      },
      rmdir(path: string): Promise<void> {
        return rmdir(path);
      },
      unlink(path: string): Promise<void> {
        return unlink(path);
      },
      stat(path: string): Promise<Stat> {
        return new Promise((resolve, reject) => {
          stat(path)
            .then((st) => {
              resolve(new Stat(st));
            })
            .catch(() => {
              reject(new ENOENT(path));
            });
        });
      },
      lstat(path: string): Promise<Stat> {
        return this.stat(path);
      },
      readdir(path: string): Promise<readonly string[]> {
        return readdir(path);
      },
      readlink(path: string): Promise<ArrayBuffer | string> {
        return this.readFile(path);
      },
      symlink(
        path: string,
        data: ArrayBuffer | Uint8Array | Blob | string
      ): Promise<void> {
        return writeFile(path, data);
      },
    },
  };
}

export const fs = Fs.fs;
