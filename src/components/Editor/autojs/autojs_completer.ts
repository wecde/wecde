import { Ace } from "ace-builds";

type Prototype = {
  readonly key: string;
  readonly url: string;
  readonly summary: string;
  readonly global: boolean;
};
type ModuleJson = {
  readonly name: string;
  readonly url?: string;
  readonly summary?: string;
  readonly properties: readonly Prototype[];
};
type Completion = {
  readonly name: string;
  readonly value: string;
  readonly score: number;
};

class Module {
  readonly globalModule: Module | null;
  readonly name: string;
  readonly url?: string;
  readonly summary?: string;
  readonly properties: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [prop: string]: Prototype;
  };
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly allProperties: Prototype[];

  constructor(json: ModuleJson, globalModule: Module | null) {
    this.globalModule = globalModule;
    this.name = json.name;
    this.url = json.url;
    this.summary = json.summary;
    this.properties = {};
    this.allProperties = [];

    const properties = json.properties;
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      this.addProperty(property);
    }
  }

  addProperty(property: Prototype): void {
    // eslint-disable-next-line functional/immutable-data
    this.properties[property.key] = property;
    this.allProperties.push(property);
    if (property.global && this.globalModule) {
      this.globalModule.addProperty(property);
    }
  }
  getCompletions(prefix: string) {
    // eslint-disable-next-line functional/prefer-readonly-type
    const completions: Completion[] = [];
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < this.allProperties.length; i++) {
      const property = this.allProperties[i];
      if (property.key.startsWith(prefix)) {
        const value = prefix ? property.key : this.name + "." + property.key;
        // eslint-disable-next-line functional/immutable-data
        completions.push({
          name: property.key,
          value: value,
          score: 1000000,
        });
      }
    }
    return completions;
  }
}

const ID_REGEX = /[a-zA-Z_0-9\$\-\u00A2-\u2000\u2070-\uFFFF]/;

export class Completer {
  readonly modules: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [prop: string]: Module;
  };
  readonly globalModule: Module;
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly allModules: Module[];

  constructor(indices: readonly ModuleJson[]) {
    this.modules = {};
    this.globalModule = new Module(
      {
        name: "globals",
        properties: [],
      },
      null
    );
    this.allModules = [];
    // eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let i = 0; i < indices.length; i++) {
      const moduleJson = indices[i];
      const module = new Module(moduleJson, this.globalModule);
      if (module.name != "globals") {
        this.modules[module.name] = module;
        this.allModules.push(module);
      }
    }
  }

  retrievePrecedingIdentifier(text: readonly string[], pos: number) {
    // eslint-disable-next-line functional/prefer-readonly-type
    const buf: string[] = [];
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = pos - 1; i >= 0; i--) {
      if (ID_REGEX.test(text[i]) || (i == pos - 1 && text[i] == "."))
        // eslint-disable-next-line functional/immutable-data
        buf.push(text[i]);
      else break;
    }
    // eslint-disable-next-line functional/immutable-data
    return buf.reverse().join("");
  }
  findCompletions(moduleName: string | null, prefix: string) {
    if (moduleName != null) {
      const module = this.modules[moduleName];
      if (!module) {
        return [];
      }
      return module.getCompletions(prefix);
    }
    // eslint-disable-next-line functional/prefer-readonly-type
    const completions: Completion[] = [];
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < this.allModules.length; i++) {
      const module = this.allModules[i];
      if (module.name.startsWith(prefix)) {
        // eslint-disable-next-line functional/immutable-data
        completions.push({
          name: module.name,
          value: module.name,
          score: 1000000,
        });
      }
    }
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i = 0; i < this.globalModule.allProperties.length; i++) {
      const property = this.globalModule.allProperties[i];
      if (property.key.startsWith(prefix)) {
        // eslint-disable-next-line functional/immutable-data
        completions.push({
          name: property.key,
          value: property.key,
          score: 1000000,
        });
      }
    }
    return completions;
  }
  getCompletions(
    _editor: Ace.Editor,
    session: Ace.EditSession,
    pos: {
      readonly row: number;
      readonly column: number;
    },
    prefix: string,
    // eslint-disable-next-line functional/prefer-readonly-type
    callback: (e: null, completions: Completion[]) => void
  ) {
    const line = session.getLine(pos.row);
    const fullPrefix = line.substring(0, pos.column);
    const dot = fullPrefix.lastIndexOf(".");

    // eslint-disable-next-line functional/no-let, functional/prefer-readonly-type
    let completions: Completion[];
    if (dot > 0) {
      prefix = fullPrefix.substring(dot + 1);
      const token = session.getTokenAt(pos.row, dot - 1);

      if (token) {
        completions = this.findCompletions(token.value, prefix);
      } else {
        completions = this.findCompletions(null, prefix);
      }
    } else {
      completions = this.findCompletions(null, prefix);
    }
    callback(null, completions);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDocTooltip() {}
}
