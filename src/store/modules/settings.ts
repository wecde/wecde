import { Module } from "vuex";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import ace from "ace-builds";
(self as any).ace = ace;
import { themesByName } from "ace-builds/src-noconflict/ext-themelist";
import i18n from "@/i18n";
import ISO from "iso-639-1";
import { basename } from "path";

export interface State {
  [group: string]: any;
}

export const stateDescription: {
  label: string;
  prop: string;
  props: {
    label: string;
    prop: string;
    type: "string" | "number" | "boolean" | "int" | "date" | "tel";
    default: boolean | number | string | Date | null;
    list:
      | {
          label: string;
          value: any;
        }[]
      | false;
  }[];
}[] = [
  {
    label: "Clone GIT",
    prop: "cloneGit",
    props: [
      {
        label: "Single branch",
        prop: "singleBranch",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        label: "No checkout",
        prop: "noCheckout",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        label: "No tags",
        prop: "noTags",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        label: "Depth",
        prop: "depth",
        type: "int",
        default: 10,
        list: false,
      },
      {
        label: "Since date",
        prop: "since",
        type: "date",
        default: null,
        list: false,
      },
      {
        label: "Exclude",
        prop: "exclude",
        type: "string",
        default: null,
        list: false,
      },
    ],
  },
  {
    label: "Appearance",
    prop: "appearance",

    props: [
      {
        label: "Language",
        prop: "language",
        type: "string",
        default: i18n.locale,
        list: require
          .context("@/locales", true, /[a-zA-Z_-]+\.json$/)
          .keys()
          .map((file) => {
            const code = basename(file, ".json");

            return {
              label: ISO.getNativeName(code),
              value: code,
            };
          }),
      },
      {
        label: "Theme",
        prop: "theme",
        type: "string",
        default: "ace/theme/dracula",
        list: Object.values(themesByName).map((theme: any) => {
          return {
            label: theme.caption,
            value: theme.theme,
          };
        }),
      },
      // {
      //   label: "Amoled Screen",
      //   prop: "amoled",
      //   default: false,
      //   type: "switch",
      // },
      // {
      //   label: "Topbar transparent",
      //   prop: "topBarTransparent",
      //   default: "solid",
      //   select: [
      //     {
      //       label: "Solid",
      //       value: "solid",
      //     },
      //     {
      //       label: "Transparent",
      //       value: "transparent",
      //     },
      //     {
      //       label: "Transparency",
      //       value: "transparency",
      //     },
      //   ],
      //   type: "list",
      // },
    ],
  },
  // {
  //   label: "BOT",
  //   prop: "bot",

  //   props: [
  //     {
  //       label: "Enabled",
  //       prop: "enabled",
  //       type: "switch",
  //       default: true,
  //     },
  //     {
  //       label: "Trigger autocomplete",
  //       prop: "autocompleteTrigger",
  //       type: "list",
  //       default: "input",
  //       select: [
  //         {
  //           label: "Input",
  //           value: "input",
  //         },
  //         {
  //           label: "Focus",
  //           value: "focus",
  //         },
  //       ],
  //     },
  //     {
  //       label: "Display autocomplete",
  //       prop: "autocompleteDisplay",
  //       type: "list",
  //       default: "enabled",
  //       select: [
  //         {
  //           label: "Enabled",
  //           value: "enabled",
  //         },
  //         {
  //           label: "Minimal",
  //           value: "minimal",
  //         },
  //         {
  //           label: "Disabled",
  //           value: "disabled",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    label: "Editor",
    prop: "editor",

    props: [
      {
        label: "Autocomplete / Check Syntax",
        prop: "autocomplete",
        type: "boolean",
        default: true,
        list: false,
      },
      // {
      //   label: "Cursor Style",
      //   prop: "cursorStyle",
      //   default: "default",
      //   type: "list",
      //   select: [
      //     {
      //       label: "Default",
      //       value: "default",
      //     },
      //     {
      //       label: "No blink",
      //       value: "no blink",
      //     },
      //     {
      //       label: "Slim",
      //       value: "slim",
      //     },
      //   ],
      // },
      {
        label: "Font Size",
        prop: "fontSize",
        type: "number",
        default: 12,
        list: [
          {
            label: "8",
            value: 8,
          },
          {
            label: "12",
            value: 12,
          },
        ],
      },
      // {
      //   label: "Font",
      //   prop: "font",
      //   type: "list",
      //   default: "12",
      //   select: [
      //     {
      //       label: "8",
      //       value: "8",
      //     },
      //     {
      //       label: "12",
      //       value: "12",
      //     },
      //   ],
      // },
      {
        label: "Keybinding",
        prop: "keybinding",
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
        label: "Line number",
        prop: "lineNumber",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        label: "Print margin",
        prop: "printMargin",
        type: "number",
        default: 0,
        list: [
          {
            label: "0",
            value: 0,
          },
          {
            label: "80",
            value: 80,
          },
          {
            label: "120",
            value: 120,
          },
        ],
      },
      {
        label: "Show invisible",
        prop: "showInvisible",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        label: "Use soft tabs",
        prop: "useSoftTabs",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        label: "Tab size",
        prop: "tabSize",
        type: "number",
        default: 2,
        list: [
          {
            label: "1",
            value: 1,
          },
          {
            label: "2",
            value: 2,
          },
          {
            label: "3",
            value: 3,
          },

          {
            label: "4",
            value: 4,
          },
          {
            label: "8",
            value: 8,
          },
        ],
      },
      {
        label: "Word wrap",
        prop: "wordWrap",
        type: "boolean",
        default: true,
        list: false,
      },
    ],
  },
  {
    label: "Preview",
    prop: "preview",

    props: [
      // {
      //   label: "Live",
      //   prop: "live",
      //   type: "switch",
      //   default: true,
      // },
      {
        label: "Port",
        prop: "port",
        type: "tel",
        default: "8080",
        list: false,
      },
    ],
  },
  {
    label: "Touch",
    prop: "touch",

    props: [
      {
        label: "Tablet",
        prop: "tablet",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        label: "Haptic keypress",
        prop: "hapticKeypress",
        type: "boolean",
        default: false,
        list: false,
      },
      {
        label: "Keyboard position",
        prop: "keyboardPosition",
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
        label: "Extra keyboard",
        prop: "extraKeyboard",
        type: "boolean",
        default: true,
        list: false,
      },
      {
        label: "Touch keyboard",
        prop: "touchKeyboard",
        type: "boolean",
        default: true,
        list: false,
      },
    ],
  },
];

const state: State = Object.create(null);

stateDescription.forEach((stateGroup) => {
  stateGroup.props.forEach((prop: any) => {
    state[stateGroup.prop + "__" + prop.prop] = prop.default;
  });
});

export const providersGIT = {
  "github.com": "GitHub",
  "bitbucket.org": "BitBucket",
  "gitlab.com": "GitLab",
  "dev.azure.com": "Dev Azure Ops",
  "*": "Other",
};

for (const host in providersGIT) {
  state[`git__${host}`] = {
    username: "",
    secure: "",
    email: "",
    name: "",
  };
}

const store: Module<State, unknown> = {
  namespaced: true,

  state,

  mutations: {
    setState(
      state,
      {
        prop,
        value,
      }: {
        prop: string;
        value: any;
      }
    ): void {
      const props = prop.replace(/\//g, "__").split("->");

      props.slice(0, props.length - 1).forEach((prop: string) => {
        state = (state as any)[prop];
      });

      (state as any)[props[props.length - 1]] = value;
    },
  },
};

export default store;
