class Event<Events> {
  private store: Map<
    Events,
    {
      (...params: any[]): void;
    }[]
  > = new Map();

  on(
    name: Events,
    callback: {
      (...params: any[]): void;
    }
  ): void {
    if (this.store.has(name) === false) {
      this.store.set(name, [callback]);
    } else {
      this.store.set(name, [...(this.store.get(name) || []), callback]);
    }
  }
  off(
    name: Events,
    callback: {
      (...params: any[]): void;
    }
  ): void {
    if (this.store.has(name)) {
      this.store.set(
        name,
        this.store.get(name)?.filter((item) => item !== callback) as any
      );
    }
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
