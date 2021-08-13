import { decode, encode } from "base-64";
import isBinaryPath from "is-binary-path-cross";
import { extname as _extname, basename, relative, resolve } from "path-cross";
import MaterialIcons from "src/assets/extensions/material-icon-theme/dist/material-icons.json";
import { StateInterface } from "src/store";
import { Store } from "vuex";

export function extname(path: string): string {
  return _extname(path).replace(/^\./g, "");
}

export function b64toBlob(
  b64Data: string,
  contentType = "",
  sliceSize = 512
): Blob {
  const byteCharacters = decode(b64Data);
  const byteArrays = [];

  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < slice.length; i++) {
      // eslint-disable-next-line functional/immutable-data
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    // eslint-disable-next-line functional/immutable-data
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function isPlainText(path: string): boolean {
  return isBinaryPath(path) === false;
}

export function getType(path: string): string {
  return (
    MaterialIcons.fileExtensions[
      extname(path) as keyof typeof MaterialIcons.fileExtensions
    ] || "text"
  );
}

export function getEditor(path: string): string {
  const type = getType(path);
  switch (type) {
    case "vue":
    case "svelte":
      return "html";
    case "i18n":
    case "settings":
      return "json";
    case "react":
      return "jsx";
  }

  return type;
}

export function isBase64(str: string): boolean {
  try {
    return encode(decode(str)) === str;
  } catch (err) {
    return false;
  }
}

export function rawText(str: string): string {
  if (isBase64(str)) {
    return decode(str);
  }

  return str;
}

export function alwayBase64(str: string): string {
  if (!!str) {
    if (isBase64(str)) {
      return str;
    }

    return encode(str);
  } else {
    return str;
  }
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
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

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = decode(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = 0; i < len; i++) {
    // eslint-disable-next-line functional/immutable-data
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function filename(path: string): string {
  return basename(path, _extname(path));
}

export function random(value: number): number {
  return Math.round(Math.random() * value);
}

export function removedPathProject(path: string): string {
  if (path.includes("projects")) {
    return relative("projects", path).replace(/^\.\.\//, "");
  }

  return path;
}

export function pathEquals(a: string, b: string): boolean {
  return resolve(a) === resolve(b);
}

export function isParentFolder(parent: string, children: string): boolean {
  parent = resolve(parent);
  children = resolve(children);
  const pathsA = parent.split("/");
  const pathsB = children.split("/");

  return (
    parent !== children &&
    pathsA.every((value, index) => value === pathsB[index])
  );
}

export function pathEqualsOrParent(path1: string, path2: string): boolean {
  return pathEquals(path1, path2) || isParentFolder(path1, path2);
}

const storeTimeoutBy = new Map<
  string,
  {
    readonly id: NodeJS.Timeout | number;
    // eslint-disable-next-line functional/prefer-readonly-type
    running: boolean;
  }
>();
export function createTimeoutBy(
  id: string,
  callback: {
    (): void | Promise<void>;
  },
  ms?: number,
  {
    skipme = false,
    immediate = false,
  }: {
    readonly skipme?: boolean;
    readonly immediate?: boolean;
  } = {
    skipme: false,
    immediate: false,
  }
): NodeJS.Timeout | number {
  if (storeTimeoutBy.has(id)) {
    if (storeTimeoutBy.get(id)?.running) {
      return -1;
    }
    if (skipme) {
      return storeTimeoutBy.get(id)?.id as NodeJS.Timeout | number;
    }

    clearTimeout(storeTimeoutBy.get(id)?.id as number);
  } else {
    if (immediate) {
      ms = 0;
    }
  }

  const timeout = setTimeout(() => {
    if (storeTimeoutBy.get(id)) {
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      (storeTimeoutBy.get(id) as any).running = true;
    }
    void callback();
    storeTimeoutBy.delete(id);
  }, ms);
  storeTimeoutBy.set(id, {
    id: timeout,
    running: false,
  });

  return timeout;
}

export function unCamelCase(str: string): string {
  return str
    .replace(/[A-Z]/, (template) => {
      return " " + template.toLowerCase();
    })
    .trimStart();
}

export async function mapAsync<T, R = T>(
  array: readonly T[],
  callback: {
    (value: T, index: number, array: readonly T[]): Promise<R>;
  }
): Promise<readonly R[]> {
  const { length } = array;
  // eslint-disable-next-line functional/prefer-readonly-type
  const result: R[] = [];
  // eslint-disable-next-line functional/no-let
  let index = 0;

  // eslint-disable-next-line functional/no-loop-statement
  while (index < length) {
    // eslint-disable-next-line functional/immutable-data
    result.push(await callback(array[index], index, array));
    index++;
  }

  return result;
}

export async function foreachAsync<T>(
  array: readonly T[],
  callback: {
    (value: T, index: number, array: readonly T[]): Promise<void>;
  }
): Promise<void> {
  const { length } = array;
  // eslint-disable-next-line functional/no-let
  let index = 0;

  // eslint-disable-next-line functional/no-loop-statement
  while (index < length) {
    await callback(array[index], index, array);
    index++;
  }
}

export function fsAllowReactive(
  path: string,
  store: Store<StateInterface>
): boolean {
  if (store.state.editor.project) {
    return (
      pathEqualsOrParent(".git", relative(store.state.editor.project, path)) ===
        false && store.getters["git-project/ignored"](path) === false
    );
  } else {
    return false;
  }
}
