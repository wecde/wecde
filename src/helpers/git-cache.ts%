import { decode, encode } from "base-64";
import { Stat } from "capacitor-fs/build/module/Stat";
import { GitIndex, GitPackIndex } from "isomorphic-git-fast";

export type Cache = {
  readonly IndexCache?: {
    readonly map: {
      readonly [fullpath: string]: GitIndex;
    };
    readonly stats: {
      readonly [fullpath: string]: Stat;
    };
  };
  readonly PackfileCache?: {
    readonly [fullpath: string]: GitPackIndex;
  };
};

function arrayBufferToBase64(buffer: readonly number[] | ArrayBuffer): string {
  // eslint-disable-next-line functional/no-let
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return encode(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary_string = decode(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  // eslint-disable-next-line functional/no-let, functional/no-loop-statement
  for (let i = 0; i < len; i++) {
    // eslint-disable-next-line functional/immutable-data
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function cacheToJson(cache: Cache): string {
  //
  return JSON.stringify(cache, (key, value) => {
    if (value?.type === "Buffer") {
      // TypedArray
      return {
        __type__: "Buffer",
        value: arrayBufferToBase64(value.data),
      };
    }
    if (value instanceof Stat) {
      return {
        __type__: "Stat",
        value: JSON.stringify(value),
      };
    }
    if (value instanceof GitIndex) {
      return {
        __type__: "GitIndex",
        value: JSON.stringify(value._entries),
      };
    }
    if (value instanceof GitPackIndex) {
      return {
        __type__: "GitPackIndex",
        value: cacheToJson({
          ...value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
      };
    }

    if (key === "getExternalRefDelta") {
      return {
        __type__: "getExternalRefDelta",
      };
    }

    return value;
  });
}

export function jsonToCache(json: string): Cache {
  return JSON.parse(json, (key, value) => {
    switch (value?.__type__) {
      case "Buffer":
        return Buffer.from(base64ToArrayBuffer(value.value));
      case "GitIndex":
        return new GitIndex(JSON.parse(value.value));
      case "Stat":
        const parse = JSON.parse(value.value);
        // eslint-disable-next-line functional/immutable-data
        parse.ctime = parse.ctimeMs;
        // eslint-disable-next-line functional/immutable-data
        parse.mtime = parse.mtimeMs;
        return new Stat(parse);
      case "GitPackIndex":
        return new GitPackIndex(jsonToCache(value.value));
      case "getExternalRefDelta":
        return undefined;
    }

    return value;
  });
}
