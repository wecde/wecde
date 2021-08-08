import { pathEqualsOrParent } from "src/utils";
import { onBeforeUnmount } from "vue";

/* eslint-disable functional/functional-parameters */
class Event<Events> {
  // eslint-disable-next-line functional/prefer-readonly-type
  private readonly store: Map<
    Events,
    readonly {
      (...params: readonly string[]): void;
    }[]
  > = new Map();

  on(
    name: Events | readonly Events[],
    callback: {
      (...params: readonly string[]): void;
    }
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
  off(
    name: Events | readonly Events[],
    callback: {
      (...params: readonly string[]): void;
    }
  ): void {
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
  once(
    name: Events,
    callback: {
      (...params: readonly string[]): void;
    }
  ): void {
    const handler = (...params: readonly string[]): void => {
      callback(...params);
      this.off(name, handler);
    };

    this.on(name, handler);
  }
  emit(name: Events, ...params: readonly string[]): void {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `event-bus: "${name as unknown as string}" from "${params[0]}`
      );
    }
    this.store.get(name)?.forEach((callback) => void callback(...params));
  }
  watch(
    name: Events | readonly Events[],
    fullpath: string,
    callback: {
      (...params: readonly string[]): void;
    }
  ): void {
    const handler = (...params: readonly string[]): void => {
      if (pathEqualsOrParent(fullpath, params[0])) {
        callback(...params);
      }
    };

    const watcher = this.on(name, handler);
    onBeforeUnmount(() => void watcher());
  }
}

export default new Event<
  | "create:file"
  | "create:dir"
  | "remove:file"
  | "remove:dir"
  | "write:file"
  | "move:file"
  | "move:dir"
  | "copy:file"
  | "copy:dir"
>();
