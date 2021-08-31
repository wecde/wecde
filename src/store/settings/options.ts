import { SUPPORT_LOCALES as localesSupportI18n } from "boot/i18n";

import { themes as themesAce } from "./options support/ace-themes";

type Type = "boolean" | "int" | "date" | "string" | "tel";

export type ValueType = boolean | number | string | Date;
const groups: readonly {
  readonly name: string;
  readonly options: readonly {
    // eslint-disable-next-line functional/prefer-readonly-type
    path?: string;
    readonly name: string;
    readonly type: Type;
    readonly default?: ValueType;
    readonly description?: string;
    readonly list:
      | false
      | readonly {
          readonly label: string;
          readonly value: string;
        }[];
  }[];
}[] = [
  {
    name: "Clone GIT",
    options: [
      {
        name: "Single branch",
        type: "boolean",
        default: true,
        list: false,
        description:
          "Instead of the default behavior of fetching all the branches, only fetch a single branch.",
      },
      {
        name: "No checkout",
        type: "boolean",
        default: false,
        list: false,
        description:
          "Skipping checkout can save a lot of time normally spent writing files to disk.",
      },
      {
        name: "No tags",
        type: "boolean",
        default: false,
        list: false,
        description:
          "By default clone will fetch all tags. noTags disables that behavior.",
      },
      {
        name: "Depth",
        type: "int",
        default: 10,
        list: false,
        description:
          "Integer. Determines how much of the git repository's history to retrieve",
      },
      {
        name: "Since date",
        type: "date",
        list: false,
        description:
          "Only fetch commits created after the given date. Mutually exclusive with depth.",
      },
      {
        name: "Exclude",
        type: "string",
        list: false,
        description:
          "A list of branches or tags. Instructs the remote server not to send us any commits reachable from these refs.",
      },
    ],
  },
  {
    name: "Appearance",
    options: [
      {
        name: "Language",
        type: "string",
        default: "en",
        list: [...localesSupportI18n],
      },
      {
        name: "Theme",
        type: "string",
        default: "ace/theme/dracula",
        list: [...themesAce],
      },
    ],
  },
  {
    name: "Editor",
    options: [
      {
        name: "Autocomplete / Check Syntax",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        name: "Font Size",
        type: "int",
        default: 12,
        list: [
          {
            label: "8px",
            value: "8",
          },
          {
            label: "12px",
            value: "12",
          },
        ],
      },
      {
        name: "Keybinding",
        type: "string",
        default: "",
        list: [
          {
            label: "Ace",
            value: "",
          },
          {
            label: "EMACS",
            value: "emacs",
          },
          {
            label: "Sublime",
            value: "sublime",
          },
          {
            label: "Vim",
            value: "vim",
          },
          {
            label: "Vscode",
            value: "vscode",
          },
        ],
      },
      {
        name: "Line number",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        name: "Print margin",
        type: "int",
        default: 0,
        list: [
          {
            label: "0px",
            value: "0",
          },
          {
            label: "80px",
            value: "80",
          },
          {
            label: "120px",
            value: "120",
          },
        ],
      },
      {
        name: "Show invisible",

        type: "boolean",
        default: false,
        list: false,
      },
      {
        name: "Use soft tabs",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        name: "Tab size",
        type: "int",
        default: 2,
        list: [
          {
            label: "1",
            value: "1",
          },
          {
            label: "2",
            value: "2",
          },
          {
            label: "3",
            value: "3",
          },
          {
            label: "4",
            value: "4",
          },
          {
            label: "8",
            value: "8",
          },
        ],
      },
      {
        name: "Word wrap",

        type: "boolean",
        default: true,
        list: false,
      },
    ],
  },
  {
    name: "Preview",
    options: [
      {
        name: "Port",
        type: "int",
        default: 8080,
        list: false,
      },
    ],
  },
  {
    name: "Touch",
    options: [
      {
        name: "Tablet",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        name: "Haptic keypress",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        name: "Keyboard position",
        type: "string",
        default: "bottom",
        list: [
          {
            label: "Top",
            value: "top",
          },
          {
            label: "Bottom",
            value: "bottom",
          },
        ],
      },
      {
        name: "Extra keyboard",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        name: "Touch keyboard",
        type: "boolean",
        default: true,
        list: false,
      },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pressedType(value: any, type: Type): any {
  if (value == null) {
    return null;
  }
  switch (type) {
    case "boolean":
      return !!value;
    case "int":
      return parseInt(value);
    case "date":
      return new Date(value);
    case "string":
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${value}`;
    case "tel":
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${value}`.replace(/[^\d]/g, "");
  }
}

export { pressedType };

export { groups };

const state: Record<string, ValueType | void> = {};

groups.forEach(({ name, options }) => {
  options.forEach((option) => {
    // eslint-disable-next-line functional/immutable-data
    state[(option.path = `${name}**${option.name}`.toLowerCase())] =
      pressedType(option.default, option.type);
  });
});

export { state };
