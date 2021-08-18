import MaterialIcons from "assets/extensions/material-icon-theme/dist/material-icons.json";
import isBinaryPath from "is-binary-path-cross";
import { extname, relative, resolve } from "path-cross";
import { StateInterface } from "src/store";
import { Store } from "vuex";

export function isPlainText(path: string): boolean {
  return isBinaryPath(path) === false;
}

export function getType(path: string): string {
  return (
    MaterialIcons.fileExtensions[
      extname(path).replace(
        /^\./,
        ""
      ) as keyof typeof MaterialIcons.fileExtensions
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

export function trim(str: string): string {
  return str.replace(/^\s|\s$/g, "");
}


