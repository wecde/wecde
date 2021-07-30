class Event<Events> {
  private store: Map<
    Events,
    {
      (...params: any[]): void;
    }[]
  > = new Map();

  on(
    name: Events | Events[],
    callback: {
      (...params: any[]): void;
    }
  ): {
    (): void;
  } {
    if (Array.isArray(name) === false) {
      name = [name as Events];
    }

    (name as Events[]).forEach((item) => {
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
    name: Events | Events[],
    callback: {
      (...params: any[]): void;
    }
  ): void {
    if (Array.isArray(name) === false) {
      name = [name as Events];
    }

    (name as Events[]).forEach((item) => {
      if (this.store.has(item)) {
        this.store.set(
          item,
          this.store.get(item)?.filter((item) => item !== callback) as any
        );
      }
    });
  }
  once(
    name: Events,
    callback: {
      (...params: any[]): void;
    }
  ): void {
    const handler = (...params: any[]): void => {
      callback(...params);
      this.once(name, handler);
    };

    this.on(name, handler);
  }
  emit(name: Events, ...params: any[]): void {
    if (process.env.NODE_ENV === "development") {
      console.info(`event-bus: "${name}" from "${params[0]}`);
    }
    this.store.get(name)?.forEach((callback) => void callback(...params));
  }
}

export default new Event<
  | "write:file"
  | "create:file"
  | "remove:file"
  | "create:dir"
  | "remove:dir"
  | "move"
  | "copy"
>();
