<template>
  <q-footer
    style="height: 41px"
    class="bottom-tools hidden-md"
    :class="{
      dark: $q.dark.isActive,
    }"
    elevated
    :model-value="inputValue"
  >
    <div
      class="bottom-tools__group justify-between"
      v-if="tabToolsBottom === 0"
    >
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="tab">
        <q-icon name="mdi-keyboard-tab" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorUp">
        <q-icon name="mdi-chevron-up" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorDown">
        <q-icon name="mdi-chevron-down" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorLeft">
        <q-icon name="mdi-chevron-left" />
      </div>
      <div
        class="item"
        v-ripple
        @mousedown="fixBlurEditor"
        @click="cursorRight"
      >
        <q-icon name="mdi-chevron-right" />
      </div>
      <div
        class="item"
        v-ripple
        @mousedown="fixBlurEditor"
        @click="openCommand"
      >
        <q-icon name="mdi-apple-keyboard-command" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="openBot">
        <q-icon name="mdi-robot" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="toolsNext">
        <q-icon name="mdi-chevron-double-right" />
      </div>
    </div>
    <div
      class="bottom-tools__group justify-between"
      v-else-if="tabToolsBottom === 1"
    >
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="toolsPrev">
        <q-icon name="mdi-chevron-double-left" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="undo">
        <q-icon name="ti-back-left-variant" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="redo">
        <q-icon name="ti-back-right-variant" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="selectAll">
        <q-icon name="mdi-select-all" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="copy">
        <q-icon name="mdi-content-copy" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cut">
        <q-icon name="mdi-content-cut" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="paste">
        <q-icon name="mdi-content-clipboard" />
      </div>

      <div class="item" v-ripple @mousedown="fixBlurEditor">
        <q-icon name="mdi-plus" />
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          class="menu-addons"
          transition-show="jump-up"
          transition-hide="jump-down"
        >
          <q-card
            flat
            class="addons"
            :class="{
              dark: $q.dark.isActive,
            }"
          >
            <div class="row no-wrap">
              <div class="col-6">
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @click="formatCode"
                  :style="{
                    opacity: supportFormat ? 1 : 0.5,
                  }"
                  :disable="supportFormat === false"
                >
                  <q-icon size="13px" name="mdi-format-align-right" />
                  <span>{{ $t("label.format") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @click="findAll"
                >
                  <q-icon size="13px" name="ti-search" />
                  <span>{{ $t("label.find-all") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @click="nextError"
                  :style="{
                    opacity: !!nextErrorer ? 1 : 0.5,
                  }"
                  :disable="!!nextErrorer === false"
                >
                  <q-icon size="13px" name="mdi-chevron-down-circle-outline" />
                  <span>{{ $t("label.next-error") }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="item" v-ripple>
                  <q-icon size="13px" name="mdi-lightning-bolt-outline" />
                  <span>{{ $t("label.definition") }}</span>
                </div>
                <div class="item" v-ripple>
                  <q-icon size="13px" name="mdi-comment-processing-outline" />
                  <span>{{ $t("label.signature") }}</span>
                </div>
                <div class="item" v-ripple>
                  <q-icon size="13px" name="mdi-information-variant" />
                  <span>{{ $t("label.show-info") }}</span>
                </div>
              </div>
            </div>
          </q-card>
        </q-menu>
      </div>
    </div>
  </q-footer>
  <div style="height: calc(100% - 41px)" ref="EditorCode" v-show="show" />
</template>

<script lang="ts">
// eslint-disable-next-line import/order
import Ace from "ace-builds";
// eslint-disable-next-line import/order
import {
  defineComponent,
  onMounted,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";

import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
// import "ace-builds/src-noconflict/ext-emmet";
import "ace-builds/src-noconflict/ext-linking";
import "ace-builds/src-noconflict/ext-settings_menu";
import "ace-builds/src-noconflict/keybinding-emacs";
import "ace-builds/src-noconflict/keybinding-sublime";
import "ace-builds/src-noconflict/keybinding-vim";
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/ext-spellcheck";
import "ace-builds/src-noconflict/ext-prompt";

import { Clipboard } from "@capacitor/clipboard";
import modelist from "ace-builds/src-noconflict/ext-modelist";
import fs from "modules/fs";
import { extname } from "path-cross";
import { getSupportInfo } from "prettier";
import type { SupportLanguage } from "prettier";
import { registerWatch } from "src/helpers/fs";
import { getScrollBehavior, setScrollBehavior } from "src/helpers/metadata";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import { usePrettierWorker } from "src/worker/prettier";

export default defineComponent({
  emits: ["change"],
  name: "Editor-Code",
  props: {
    fullpath: {
      type: String,
      required: true,
    },
    inputValue: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fullpath } = toRefs(props);
    const EditorCode = ref<HTMLElement | null>(null);
    const ace: {
      value: Ace.Ace.Editor | null;
    } = {
      value: null,
    };
    const nextErrorer = ref<Ace.Ace.Annotation | null>(null);

    function onChange(): void {
      createTimeoutBy(
        "editor.code.timeout-saving-file",
        () => {
          if (ace.value) {
            void fs.writeFile(fullpath.value, ace.value.getValue());

            const { row, column } = ace.value.getCursorPosition();
            const annotations = ace.value.session
              .getAnnotations()
              .filter((item) => item.type === "error");

            nextErrorer.value =
              (annotations.find((error) => {
                if (error.row !== undefined && error.row > row) {
                  return true;
                }

                if (
                  error.row === row &&
                  error.column !== undefined &&
                  error.column > column
                ) {
                  return true;
                }
              }) ||
                annotations[0]) ??
              null;
          }
        },
        1000
      );

      emit("change");
    }

    function onScroll(): void {
      createTimeoutBy(
        "on scroll editor",
        async () => {
          await setScrollBehavior(fullpath.value, {
            left: ace.value?.session.getScrollLeft() || 0,
            top: ace.value?.session.getScrollTop() || 0,
            row: ace.value?.getCursorPosition()?.row || 0,
            column: ace.value?.getCursorPosition()?.column || 0,
          });
        },
        1000
      );
    }

    // eslint-disable-next-line functional/no-let
    let watcherFile: () => void;

    async function loadFile(fullpath: string): Promise<void> {
      const { mode } = modelist.getModeForPath(fullpath);

      try {
        // remove handle change
        ace.value?.off("change", onChange);

        // register
        if (watcherFile) {
          watcherFile();
        }
        watcherFile = registerWatch(
          () => fullpath,
          async () => {
            if (ace.value) {
              const metadata = {
                left: ace.value.session.getScrollLeft() || 0,
                top: ace.value.session.getScrollTop() || 0,
                row: ace.value.getCursorPosition()?.row || 0,
                column: ace.value.getCursorPosition()?.column || 0,
              };

              try {
                const raw = await fs.readFile(fullpath, "utf8");

                if (raw !== ace.value.getValue()) {
                  ace.value?.off("change", onChange);
                  ace.value.setValue(raw);
                  ace.value?.on("change", onChange);
                }
              } catch (err) {
                if (err.code === "ENOENT") {
                  ace.value?.off("change", onChange);
                  ace.value.setValue("");
                  ace.value?.on("change", onChange);
                }
              }

              ace.value.clearSelection();

              ace.value.session.setScrollLeft(metadata.left);
              ace.value.session.setScrollTop(metadata.top);
              ace.value.moveCursorTo(metadata.row, metadata.column);
            }
          },
          {
            immediate: true,
          }
        );

        // ace.value?.setValue(await fs.readFile(fullpath, "utf8"));
        ace.value?.session.setMode(mode);

        console.log(`Language mode: ${mode as string}`);

        ace.value?.on("change", onChange);

        Ace.require(`ace/snippets/${mode as string}`);

        // remove handle scroll if setValue success
        ace.value?.session.off("changeScrollTop", onScroll);
        ace.value?.session.off("changeScrollLeft", onScroll);
        ace.value?.session.selection.off("changeCursor", onScroll);

        /// restore scroll behavior
        const { top, left, row, column } = await getScrollBehavior(fullpath);

        ace.value?.session.setScrollLeft(left);
        ace.value?.session.setScrollTop(top);
        ace.value?.moveCursorTo(row, column);

        // add event scroll
        ace.value?.session.on("changeScrollTop", onScroll);
        ace.value?.session.on("changeScrollLeft", onScroll);
        ace.value?.session.selection.on("changeCursor", onScroll);
      } catch {}
    }

    onMounted(() => {
      if (EditorCode.value) {
        ace.value = Ace.edit(EditorCode.value);

        ace.value.setOptions({
          enableLinking: true,
          autoScrollEditorIntoView: true,
          enableSnippets: true,
          enableBasicAutocompletion:
            store.state.settings["editor**autocomplete / check syntax"],
          enableLiveAutocompletion:
            store.state.settings["editor**autocomplete / check syntax"],
          // enableEmmet: true,
          // enableCodeLens: true,
        });

        watchEffect(() => {
          if (ace.value) {
            ace.value.setTheme(
              `${store.state.settings["appearance**theme"] as string}`
            );
            ace.value.setKeyboardHandler(
              !!store.state.settings["editor**keybinding"]
                ? `ace/keyboard/${
                    store.state.settings["editor**keybinding"] as string
                  }`
                : ""
            );
            ace.value.setOption(
              "showGutter",
              store.state.settings["editor**line number"] as boolean
            );
            ace.value.setShowPrintMargin(
              +(store.state.settings["editor**print margin"] as number) > 0
            );
            ace.value.setPrintMarginColumn(
              +(store.state.settings["editor**print margin"] as number)
            );
            ace.value.setShowInvisibles(
              store.state.settings["editor**show invisible"] as boolean
            );
            ace.value.session.setUseSoftTabs(
              store.state.settings["editor**use soft tabs"] as boolean
            );
            ace.value.session.setTabSize(
              +(store.state.settings["editor**tab size"] as number)
            );
            ace.value.session.setUseWrapMode(
              store.state.settings["editor**word wrap"] as boolean
            );
          }
        });

        watch(
          fullpath,
          (value) => {
            void loadFile(value);
          },
          {
            immediate: true,
          }
        );
      }
    });

    return {
      ace,
      EditorCode,
      tabToolsBottom: ref<number>(0),
      nextErrorer,
    };
  },

  computed: {
    parser(): SupportLanguage | void {
      const ext = extname(this.fullpath || "");
      // 私©れ宛d
      return getSupportInfo().languages.find((item: SupportLanguage) => {
        return item.extensions?.some((extTest: string) => ext === extTest);
      });
    },
    supportFormat(): boolean {
      return !!this.parser;
    },
  },

  methods: {
    fixBlurEditor(event: MouseEvent): void {
      event.preventDefault();
    },
    tab(): void {
      this.ace.value?.insert("\t");
    },
    cursorUp(): void {
      const isEmpty = this.ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.ace.value?.session.selection.moveCursorUp();

        this.ace.value?.clearSelection();
      } else {
        this.ace.value?.session.selection.moveCursorUp();
      }
    },
    cursorDown(): void {
      const isEmpty = this.ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.ace.value?.session.selection.moveCursorDown();
        this.ace.value?.clearSelection();
      } else {
        this.ace.value?.session.selection.moveCursorDown();
      }
    },
    cursorLeft(): void {
      const isEmpty = this.ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.ace.value?.session.selection.moveCursorLeft();
        this.ace.value?.clearSelection();
      } else {
        this.ace.value?.session.selection.moveCursorLeft();
      }
    },
    cursorRight(): void {
      const isEmpty = this.ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.ace.value?.session.selection.moveCursorRight();
        this.ace.value?.clearSelection();
      } else {
        this.ace.value?.session.selection.moveCursorRight();
      }
    },
    openCommand(): void {
      this.ace.value?.execCommand("openCommandPallete");
    },
    openBot(): void {
      console.log("open bot");
    },
    toolsNext(): void {
      this.tabToolsBottom = 1;
    },
    toolsPrev(): void {
      this.tabToolsBottom = 0;
    },
    undo(): void {
      this.ace.value?.undo();
    },
    redo(): void {
      this.ace.value?.redo();
    },
    selectAll(): void {
      this.ace.value?.selectAll();
    },
    async copy(): Promise<void> {
      const string = this.ace.value?.getCopyText();
      this.ace.value?.execCommand("copy");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async cut(): Promise<void> {
      const string = this.ace.value?.getCopyText();
      this.ace.value?.execCommand("cut");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async paste(): Promise<void> {
      const { type, value } = await Clipboard.read();

      if (type === "text/plain") {
        this.ace.value?.execCommand("paste", value);
      }
    },

    async formatCode(): Promise<void> {
      if (this.ace.value && this.parser) {
        const code = this.ace.value.getValue();

        this.ace.value.setValue(
          await usePrettierWorker().format(code, {
            parser:
              this.parser.parsers[0] === "babel"
                ? "babel-flow"
                : this.parser.parsers[0],
          })
        );
        this.ace.value.clearSelection();
      }
    },
    nextError(): void {
      if (this.ace.value) {
        if (this.nextErrorer) {
          this.ace.value.moveCursorTo(
            this.nextErrorer.row || 0,
            this.nextErrorer.column || 0
          );
        }
      }
    },
    findAll(): void {
      if (this.ace.value) {
        const keyword = this.ace.value.getCopyText();
        console.log(`find all "${keyword}`);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.bottom-tools {
  background-color: #f5f7f9;
  &.dark {
    background-color: #0e0e0e !important;
  }
  width: 100%;
  padding: {
    left: 5px;
    right: 5px;
  }

  z-index: 5 !important;

  &__group {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .item {
    color: rgb(86, 88, 92);
  }

  &.dark {
    .item {
      color: #b7b9c3;
    }
  }

  .item {
    position: relative;
    padding: 0 5px;
    font-size: 25px;
    height: 100%;
    line-height: 41px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: (100% / 9); //43px
    flex: 0 0 (100% / 9);
    > * {
      font-size: inherit;
      color: inherit;
    }
  }

  .btns {
    overflow: {
      x: scroll;
      y: hidden;
    }
    height: 100%;
  }
}

.addons {
  background: #fff;
  color: #56585c;
  &.dark {
    background-color: #222;
    color: #d3d4da;
  }
  box-shadow: 0 -1px 2px rgb(0 0 0 / 10%);
  border: none;
  width: 100%;
  padding: 8px 16px;

  .item {
    // color: #b9bbc1;
    position: relative;
  }
  // &.dark {
  //   .item {
  //     color: #ddd;
  //   }
  // }

  .item {
    display: block;
    text-decoration: none;
    padding: 0.25em 1.5em;

    span {
      margin-left: 12px;
    }
  }
}
</style>

<style lang="scss">
.menu-addons {
  width: 100% !important;
  max-width: 100% !important;
  // top: auto !important;
  left: 0 !important;
  // bottom: 41px !important;
}
</style>
