type Types = {
  readonly boolean: boolean;
  readonly int: number;
  readonly date: Date;
  readonly string: string;
};
type ItemOption<
  Type extends keyof Types,
  List extends
    | readonly {
        readonly label: string;
        readonly value: Types[Type];
      }[]
    | void
> = {
  // eslint-disable-next-line functional/prefer-readonly-type
  path?: string;
  readonly name: string;
  readonly type: Type;
  readonly default?: List extends readonly {
    readonly label: string;
    readonly value: infer Values;
  }[]
    ? Values
    : Types[Type];
  readonly description: string;
  readonly placeholder?: string;
  readonly list?: List;
};

// eslint-disable-next-line functional/prefer-readonly-type
export const groups: {
  readonly name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly options: readonly ItemOption<keyof Types, any>[];
}[] = [];

class SettingGroup {
  // eslint-disable-next-line functional/prefer-readonly-type, @typescript-eslint/no-explicit-any
  private readonly options: ItemOption<keyof Types, any>[] = [];

  constructor(name: string) {
    // eslint-disable-next-line functional/immutable-data
    groups.push({
      name,
      options: this.options,
    });
  }

  addOption<
    T extends keyof Types,
    G extends readonly {
      readonly label: string;
      readonly value: Types[T];
    }[]
  >(opt: ItemOption<T, G>): SettingGroup {
    this.options.push(opt);

    return this;
  }
}

export function createSettingGroup(name: string) {
  return new SettingGroup(name);
}

export const state: Record<string, unknown> = {};

export function refreshState(): void {
  groups.forEach(({ name, options }) => {
    options.forEach((option) => {
      // eslint-disable-next-line functional/immutable-data
      state[(option.path = `${name}**${option.name}`.toLowerCase())] =
        option.default;
    });
  });
}

import "./register-options-default";
