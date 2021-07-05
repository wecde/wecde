// eslint-disable-next-line no-unused-vars
import ace from "ace-builds";
import { themesByName } from "ace-builds/src-noconflict/ext-themelist";

export const stateDescription = [
  {
    label: "Appearance",
    prop: "appearance",
    icon: "mdi-format-paint",
    props: [
      {
        label: "Language",
        prop: "language",
        select: [
          {
            label: "English",
            value: "en",
          },
        ],
        default: "en",
        type: "list",
      },
      {
        label: "Theme",
        prop: "theme",
        select: Object.values(themesByName).map((theme) => {
          return {
            label: theme.caption,
            value: theme.theme,
          };
        }),
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
    icon: "mdi-android-auto",
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
    icon: "mdi-code-braces",
    props: [
      {
        label: "Autocomplete / Check Syntax",
        prop: "autocomplete",
        type: "switch",
        default: true,
      },
      {
        label: "Cursor Style",
        prop: "cursorStyle",
        default: "default",
        type: "list",
        select: [
          {
            label: "Default",
            value: "default",
          },
          {
            label: "No blink",
            value: "no blink",
          },
          {
            label: "Slim",
            value: "slim",
          },
        ],
      },
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
        default: "ace",
        select: [
          {
            label: "Ace",
            value: "ace",
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
    icon: "mdi-image-outline",
    props: [
      {
        label: "Live",
        prop: "live",
        type: "switch",
        default: true,
      },
      {
        label: "Reactive",
        prop: "reactive",
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
    icon: "mdi-cellphone",
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

  stateGroup.props.forEach((prop) => {
    state[stateGroup.prop][prop.prop] = prop.default;
  });
});

export default {
  namespaced: true,

  state: {
    git: {
      provide: "github",
      username: "",
      secure: "",
      email: "",
    },
    ...state,
  },
};
