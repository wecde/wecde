import { SUPPORT_LOCALES as localesSupportI18n } from "boot/i18n";

import { createSettingGroup, refreshState } from "./options";
import { themes as themesAce } from "./options support/ace-themes";

createSettingGroup("Git")
  .addOption({
    name: "Single branch",
    type: "boolean",
    default: true,
    description:
      "Instead of the default behavior of fetching all the branches, only fetch a single branch.",
  })
  .addOption({
    name: "No checkout",
    type: "boolean",
    default: false,
    description:
      "Skipping checkout can save a lot of time normally spent writing files to disk.",
  })
  .addOption({
    name: "No tags",
    type: "boolean",
    default: false,
    description:
      "By default clone will fetch all tags. noTags disables that behavior.",
  })
  .addOption({
    name: "Depth",
    type: "int",
    default: 1,
    description:
      "Integer. Determines how much of the git repository's history to retrieve",
  })
  .addOption({
    name: "Since date",
    type: "date",
    description:
      "Only fetch commits created after the given date. Mutually exclusive with depth.",
  })
  .addOption({
    name: "Exclude",
    type: "string",
    description:
      "A list of branches or tags. Instructs the remote server not to send us any commits reachable from these refs.",
  });
createSettingGroup("Appearance")
  .addOption({
    name: "Language",
    type: "string",
    default: "en",
    list: [...localesSupportI18n],
    description: "Change the display language.",
  })
  .addOption({
    name: "Theme",
    type: "string",
    default: "ace/theme/dracula",
    list: [...themesAce],
    description:
      "Change the editor theme which changes the colors of syntax highlighting.",
  });
createSettingGroup("Editor")
  .addOption({
    name: "Autocomplete / Check Syntax",
    type: "boolean",
    default: true,
    description:
      "Enables advanced autocompletion and syntax checking when available for supported languages. Disabling this can help improve performance.",
  })
  .addOption({
    name: "Font Size",
    type: "int",
    default: 12,
    list: [
      {
        label: "8px",
        value: 8,
      },
      {
        label: "12px",
        value: 12,
      },
    ],
    description: "Changes the font size of the editor.",
  })
  .addOption({
    name: "Keybinding",
    type: "string",
    default: "",
    list: [
      { label: "Ace", value: "" },
      { label: "EMACS", value: "emacs" },
      { label: "Sublime", value: "sublime" },
      { label: "Vim", value: "vim" },
      { label: "Vscode", value: "vscode" },
    ],
    description: "Changes some of the editor keyboard shortcuts.",
  })
  .addOption({
    name: "Line number",
    type: "boolean",
    default: true,
    description: "Toggles the line numbers in the editor.",
  })
  .addOption({
    name: "Print margin",
    type: "int",
    default: 0,
    list: [
      {
        label: "0px",
        value: 0,
      },
      {
        label: "80px",
        value: 80,
      },
      {
        label: "120px",
        value: 120,
      },
    ],
    description:
      "Add a print margin to indicate the cutoff at (80/120) column.",
  })
  .addOption({
    name: "Show invisible",
    type: "boolean",
    default: false,
    description:
      "Show invisible characters such as new lines, return carriage, spaces, and tabs. Used ti visually differentiate spaces from tabs.",
  })
  .addOption({
    name: "Use soft tabs",
    type: "boolean",
    default: true,
    description:
      "Toggles whether to use software tabs (spaces) or beak tabs. Turn this off to switch to using real tabs.",
  })
  .addOption({
    name: "Tab size",
    type: "int",
    default: 2,
    list: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "8", value: 8 },
    ],
    description: "Change the number of spaces a tab visually takes up.",
  })
  .addOption({
    name: "Word wrap",
    type: "boolean",
    default: true,
    description: "Toggles soft line wraps in the editor.",
  });
createSettingGroup("Preview").addOption({
  name: "Port",
  type: "int",
  default: 8080,
  description: "Port start for Nano HTTPD Server.",
});
createSettingGroup("Help").addOption({
  name: "Developer Tools",
  type: "boolean",
  default: false,
  description: "Do you enable dev tools for the editor?",
});

refreshState();
