import { Module } from "vuex";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import ace from "ace-builds";
(self as any).ace = ace;
import { themesByName } from "ace-builds/src-noconflict/ext-themelist";
import i18n from "@/i18n";
import ISO from "iso-639-1";
import { basename } from "path";

export const stateDescription = [
  {
    label: "Clone GIT",
    prop: "cloneGit",
    props: [
      {
        label: "Single branch",
        prop: "singleBranch",
        type: "switch",
        default: true,
      },
      {
        label: "No checkout",
        prop: "noCheckout",
        type: "switch",
        default: false,
      },
      {
        label: "No tags",
        prop: "noTags",
        type: "switch",
        default: false,
      },
      {
        label: "Depth",
        prop: "depth",
        type: "tel",
        default: 10,
      },
      {
        label: "Since date",
        prop: "since",
        type: "date",
        default: null,
      },
      {
        label: "Exclude",
        prop: "exclude",
        type: "text",
        default: null,
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
        select: require
          .context("@/locales", true, /[a-zA-Z_-]+\.json$/)
          .keys()
          .map((file) => {
            const code = basename(file, ".json");

            return {
              label: ISO.getNativeName(code),
              value: code,
            };
          }),
        default: i18n.locale,
        type: "list",
      },
      {
        label: "Theme",
        prop: "theme",
        select: Object.values(themesByName).map((theme: any) => {
          return {
            label: theme.caption,
            value: theme.theme,
          };
        }),
        default: "ace/theme/github",
        type: "list",
      },
      {
        label: "Amoled Screen",
        prop: "amoled",
        default: false,
        type: "switch",
      },
      {
        label: "Topbar transparent",
        prop: "topBarTransparent",
        default: "solid",
        select: [
          {
            label: "Solid",
            value: "solid",
          },
          {
            label: "Transparent",
            value: "transparent",
          },
          {
            label: "Transparency",
            value: "transparency",
          },
        ],
        type: "list",
      },
    ],
  },
  {
    label: "BOT",
    prop: "bot",

    props: [
      {
        label: "Enabled",
        prop: "enabled",
        type: "switch",
        default: true,
      },
      {
        label: "Trigger autocomplete",
        prop: "autocompleteTrigger",
        type: "list",
        default: "input",
        select: [
          {
            label: "Input",
            value: "input",
          },
          {
            label: "Focus",
            value: "focus",
          },
        ],
      },
      {
        label: "Display autocomplete",
        prop: "autocompleteDisplay",
        type: "list",
        default: "enabled",
        select: [
          {
            label: "Enabled",
            value: "enabled",
          },
          {
            label: "Minimal",
            value: "minimal",
          },
          {
            label: "Disabled",
            value: "disabled",
          },
        ],
      },
    ],
  },
  {
    label: "Editor",
    prop: "editor",

    props: [
      {
        label: "Autocomplete / Check Syntax",
        prop: "autocomplete",
        type: "switch",
        default: true,
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
        type: "list",
        default: "12",
        select: [
          {
            label: "8",
            value: "8",
          },
          {
            label: "12",
            value: "12",
          },
        ],
      },
      {
        label: "Font",
        prop: "font",
        type: "list",
        default: "12",
        select: [
          {
            label: "8",
            value: "8",
          },
          {
            label: "12",
            value: "12",
          },
        ],
      },
      {
        label: "Keybinding",
        prop: "keybinding",
        type: "list",
        default: "",
        select: [
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
        type: "switch",
        default: true,
      },
      {
        label: "Print margin",
        prop: "printMargin",
        type: "list",
        default: "0",
        select: [
          {
            label: "0",
            value: "0",
          },
          {
            label: "80",
            value: "80",
          },
          {
            label: "120",
            value: "120",
          },
        ],
      },
      {
        label: "Show invisible",
        prop: "showInvisible",
        type: "switch",
        default: false,
      },
      {
        label: "Use soft tabs",
        prop: "useSoftTabs",
        type: "switch",
        default: true,
      },
      {
        label: "Tab size",
        prop: "tabSize",
        type: "list",
        default: "2",
        select: [
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
        label: "Word wrap",
        prop: "wordWrap",
        type: "switch",
        default: true,
      },
    ],
  },
  {
    label: "Preview",
    prop: "preview",

    props: [
      {
        label: "Live",
        prop: "live",
        type: "switch",
        default: true,
      },
      {
        label: "Port",
        prop: "port",
        type: "tel",
        default: "8080",
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
        type: "switch",
        default: false,
      },
      {
        label: "Haptic keypress",
        prop: "hapticKeypress",
        type: "switch",
        default: false,
      },
      {
        label: "Keyboard position",
        prop: "keyboardPosition",
        type: "list",
        default: "bottom",
        select: [
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
        type: "switch",
        default: true,
      },
      {
        label: "Touch keyboard",
        prop: "touchKeyboard",
        type: "switch",
        default: true,
      },
    ],
  },
];

const state = Object.create(null);

stateDescription.forEach((stateGroup) => {
  state[stateGroup.prop] = {};

  stateGroup.props.forEach((prop: any) => {
    state[stateGroup.prop][prop.prop] = prop.default;
  });
});

export const providersGIT = {
  "github.com": "GitHub",
  "bitbucket.org": "BitBucket",
  "gitlab.com": "GitLab",
  "dev.azure.com": "Dev Azure Ops",
  "*": "Other",
};

export interface State {
  git: {
    [hostname: string]: {
      username: string;
      secure: string;
      email: string;
    };
  };
  [group: string]: {
    [prop: string]: any;
  };
}
const store: Module<State, unknown> = {
  namespaced: true,

  state: {
    git: {
      "github.com": {
        username: "",
        secure: "",
        email: "",
      },
      "bitbucket.org": {
        username: "",
        secure: "",
        email: "",
      },
      "gitlab.com": {
        username: "",
        secure: "",
        email: "",
      },
      "dev.azure.com": {
        username: "",
        secure: "",
        email: "",
      },
      "*": {
        username: "",
        secure: "",
        email: "",
      },
    },
    ...state,
  },

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
      const props = prop.split("/");

      props.slice(0, props.length - 1).forEach((prop: string) => {
        state = (state as any)[prop];
      });

      (state as any)[props[props.length - 1]] = value;
    },
  },
};

export default store;
