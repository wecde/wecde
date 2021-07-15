<template>
  <div class="fill-height">
    <v-bottom-navigation
      app
      fixed
      height="41"
      class="d-block order-2 bottom-tools"
    >
      <div
        class="bottom-tools__group justify-space-between"
        v-if="tabToolsBottom === 0"
      >
        <div class="item" v-ripple @click="tab">
          <v-icon>mdi-keyboard-tab</v-icon>
        </div>
        <div class="item" v-ripple @click="cursorUp">
          <v-icon>mdi-chevron-up</v-icon>
        </div>
        <div class="item" v-ripple @click="cursorDown">
          <v-icon>mdi-chevron-down</v-icon>
        </div>
        <div class="item" v-ripple @click="cursorLeft">
          <v-icon>mdi-chevron-left</v-icon>
        </div>
        <div class="item" v-ripple @click="cursorRight">
          <v-icon>mdi-chevron-right</v-icon>
        </div>
        <div class="item" v-ripple @click="openCommand">
          <v-icon>mdi-apple-keyboard-command</v-icon>
        </div>
        <div class="item" v-ripple @click="openBot">
          <v-icon>mdi-robot</v-icon>
        </div>
        <div class="item" v-ripple @click="toggleLock">
          <v-icon>{{
            isLock ? "mdi-lock-open-variant-outline" : "mdi-lock-outline"
          }}</v-icon>
        </div>
        <div class="item" v-ripple @click="toolsNext">
          <v-icon>mdi-chevron-double-right</v-icon>
        </div>
      </div>
      <div
        class="bottom-tools__group justify-space-between"
        v-else-if="tabToolsBottom === 1"
      >
        <div class="item" v-ripple @click="toolsPrev">
          <v-icon>mdi-chevron-double-left</v-icon>
        </div>
        <div class="item" v-ripple @click="undo">
          <v-icon>mdi-undo-variant</v-icon>
        </div>
        <div class="item" v-ripple @click="redo">
          <v-icon>mdi-redo-variant</v-icon>
        </div>
        <div class="item" v-ripple @click="selectAll">
          <v-icon>mdi-select-all</v-icon>
        </div>
        <div class="item" v-ripple @click="copy">
          <v-icon>mdi-content-copy</v-icon>
        </div>
        <div class="item" v-ripple @click="cut">
          <v-icon>mdi-content-cut</v-icon>
        </div>
        <div class="item" v-ripple @click="paste">
          <v-icon>mdi-content-paste</v-icon>
        </div>
        <v-menu
          content-class="menu-tools-addons"
          left
          fixed
          internal-activator
          max-width="100%"
          width="100%"
          transition="slide-y-reverse-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <div class="item" v-ripple v-on="on">
              <v-icon v-bind="attrs">mdi-plus</v-icon>
            </div>
          </template>

          <v-card flat width="100%" class="addons">
            <v-layout>
              <v-flex>
                <div
                  class="item"
                  v-ripple
                  @click="formatCode"
                  :style="{
                    opacity: supportFormat ? 1 : 0.5,
                  }"
                  :disabled="supportFormat === false"
                >
                  <v-icon size="1em">mdi-format-align-right</v-icon>
                  <span>Format</span>
                </div>
                <div class="item" v-ripple>
                  <v-icon size="1em">mdi-magnify</v-icon>
                  <span>Find All</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @click="nextError"
                  :style="{
                    opacity: !!nextError ? 1 : 0.5,
                  }"
                  :disabled="!!nextError === false"
                >
                  <v-icon size="1em">mdi-chevron-down-circle-outline</v-icon>
                  <span>Next Error</span>
                </div>
              </v-flex>
              <v-flex>
                <div class="item" v-ripple>
                  <v-icon size="1em">mdi-lightning-bolt-outline</v-icon>
                  <span>Definition</span>
                </div>
                <div class="item" v-ripple>
                  <v-icon size="1em">mdi-comment-processing-outline</v-icon>
                  <span>Signature</span>
                </div>
                <div class="item" v-ripple>
                  <v-icon size="1em">mdi-information-variant</v-icon>
                  <span>Show Info</span>
                </div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-menu>
      </div>
    </v-bottom-navigation>
    <div class="Editor-Code fill-height order-1" ref="EditorCode" />
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  defineComponent,
  toRefs,
  computed,
  onMounted,
  ref,
  watch,
  onBeforeUnmount,
} from "@vue/composition-api";
import ace from "ace-builds";
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
import { getEditor, rawText } from "@/utils";
import { readFile, writeFile } from "@/modules/filesystem";
import store from "@/store";
import { Clipboard } from "@capacitor/clipboard";
import { extname } from "path";
import { format, getSupportInfo } from "prettier";
import parserAngular from "prettier/parser-angular";
import parserBabel from "prettier/parser-babel";
import parserEspress from "prettier/parser-espree";
import parserFlow from "prettier/parser-flow";
import parserGraphql from "prettier/parser-graphql";
import parserHTML from "prettier/parser-html";
import parserMarkdown from "prettier/parser-markdown";
import parserMeriyah from "prettier/parser-meriyah";
import parserPostCSS from "prettier/parser-postcss";
import parserTypescript from "prettier/parser-typescript";
import parserYaml from "prettier/parser-yaml";
// import standalone from "prettier/standalone";

export default defineComponent({
  props: {
    fullpath: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { fullpath } = toRefs(props);
    const base64 = ref<string | null>(null);

    const typeEditor = computed<string>(
      () => getEditor(fullpath.value) || "text"
    );

    const EditorCode = ref<HTMLElement | null>(null);

    const $ace: {
      value: ace.Ace.Editor | null;
    } = {
      value: null,
    };

    function savePostionEditor(): void {
      store.commit("editor/setScrollEnhance", {
        file: fullpath.value,
        value: {
          x: $ace.value?.session.getScrollLeft() || 0,
          y: $ace.value?.session.getScrollTop() || 0,
          cursorRow: $ace.value?.getCursorPosition()?.row || 0,
          cursorColumn: $ace.value?.getCursorPosition()?.column || 0,
        },
      });
    }

    let timeoutSaveFile: any;

    function createEditor() {
      if (EditorCode.value) {
        $ace.value = ace.edit(EditorCode.value);

        clearTimeout(timeoutSaveFile);

        $ace.value.on("change", () => {
          clearTimeout(timeoutSaveFile);

          timeoutSaveFile = setTimeout(
            async () =>
              void (await writeFile(
                fullpath.value,
                $ace.value?.getValue() || ""
              )),
            100
          );

          emit("change");
        });
        $ace.value.session.on(
          "changeScrollTop",
          () => void savePostionEditor()
        );
        $ace.value.session.on(
          "changeScrollLeft",
          () => void savePostionEditor()
        );
        $ace.value.session.selection.on(
          "changeCursor",
          () => void savePostionEditor()
        );

        $ace.value.setOptions({
          enableLinking: true,
          autoScrollEditorIntoView: true,
          enableSnippets: true,
          enableBasicAutocompletion: store.state.settings.editor.autocomplete,
          enableLiveAutocompletion: store.state.settings.editor.autocomplete,
          // enableEmmet: true,
          // enableCodeLens: true,
        });

        $ace.value.setTheme(`${store.state.settings.appearance.theme}`);
        $ace.value.setKeyboardHandler(
          // eslint-disable-next-line no-extra-boolean-cast
          !!store.state.settings.editor.keybinding
            ? `ace/keyboard/${store.state.settings.editor.keybinding}`
            : ""
        );
        $ace.value.setOption(
          "showGutter",
          store.state.settings.editor.lineNumber
        );
        $ace.value.setShowPrintMargin(
          +store.state.settings.editor.printMargin > 0
        );
        $ace.value.setPrintMarginColumn(
          +store.state.settings.editor.printMargin
        );
        $ace.value.setShowInvisibles(store.state.settings.editor.showInvisible);
        $ace.value.session.setUseSoftTabs(
          store.state.settings.editor.useSoftTabs
        );
        $ace.value.session.setTabSize(+store.state.settings.editor.tabSize);
        $ace.value.session.setUseWrapMode(store.state.settings.editor.wordWrap);
      }
    }

    onMounted(() => {
      createEditor();

      watch(fullpath, () => void savePostionEditor());

      watch(base64, (newValue) => {
        if ($ace.value) {
          const { x, y, cursorRow, cursorColumn } = store.state.editor
            .scrollEnhance[fullpath.value] || {
            x: 0,
            y: 0,
            cursorRow: 0,
            cursorColumn: 0,
          };

          $ace.value.setValue(rawText(newValue || ""));
          $ace.value.clearSelection();

          setTimeout(() => {
            $ace.value?.session.setScrollLeft(x);
            $ace.value?.session.setScrollTop(y);
            $ace.value?.moveCursorTo(cursorRow, cursorColumn);
          }, 1);

          $ace.value.session.setMode(`ace/mode/${typeEditor.value}`);
          ace.require(`ace/snippets/${typeEditor.value}`);
        }
      });

      watch(
        fullpath,
        async (newValue) => {
          try {
            base64.value = await readFile(newValue);
          } catch {
            base64.value = null;
            console.error(`file ${newValue} not ready`);
          }
        },
        {
          immediate: true,
        }
      );
    });

    function removeEditor() {
      if ($ace.value) {
        $ace.value.destroy();
        $ace.value = null;
      }
    }

    onBeforeUnmount(() => void removeEditor());

    return {
      $ace,
      EditorCode,
      isLock: ref<boolean>(false),
      tabToolsBottom: ref<number>(0),
    };
  },

  watch: {
    "$store.state.settings.appearance.theme": {
      handler(newValue) {
        console.log("theme changed");
        if (this.$ace.value) {
          this.$ace.value.setTheme(`${newValue}`);
        }
      },
    },
    "$store.state.settings.editor.autocomplete": {
      handler(newValue) {
        if (this.$ace.value) {
          (this.$ace.value as any).setOption(
            "enableBasicAutocompletion",
            newValue
          );
          (this.$ace.value as any).setOption(
            "enableLiveAutocompletion",
            newValue
          );
        }
      },
    },
    "$store.state.settings.editor.keybinding": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setKeyboardHandler(`ace/keyboard/${newValue}`);
        }
      },
    },
    "$store.state.settings.editor.lineNumber": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setOption("showGutter", newValue);
        }
      },
    },
    "$store.state.settings.editor.printMargin": {
      handler(newValue) {
        if (this.$ace.value) {
          newValue = +newValue;
          this.$ace.value.setShowPrintMargin(newValue > 0);
          this.$ace.value.setPrintMarginColumn(newValue);
        }
      },
    },
    "$store.state.settings.editor.showInvisible": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setShowInvisibles(newValue);
        }
      },
    },
    "$store.state.settings.editor.useSoftTabs": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.session.setUseSoftTabs(newValue);
        }
      },
    },
    "$store.state.settings.editor.tabSize": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.session.setTabSize(+newValue);
        }
      },
    },
    "$store.state.settings.editor.wordWrap": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.session.setUseWrapMode(newValue);
        }
      },
    },
  },

  computed: {
    parser(): any {
      const ext = extname(this.fullpath || "");
      // 私©れ宛d
      return getSupportInfo().languages.find((item: any) => {
        return item.extensions.some((extTest: string) => ext === extTest);
      });
    },
    supportFormat(): boolean {
      return !!this.parser;
    },
    nextError(): any {
      if (this.$ace.value) {
        const { row, column } = this.$ace.value.getCursorPosition() || {
          row: 0,
          column: 0,
        };

        return (
          this.$ace.value.session.getAnnotations().find((error: any) => {
            return (
              error.type === "error" &&
              (error.row > row || (error.row === row && error.column > column))
            );
          }) ||
          this.$ace.value.session
            .getAnnotations()
            .find((error) => error.type === "error")
        );
      }

      return null;
    },
  },

  methods: {
    tab() {
      this.$ace.value?.insert("\t");
    },
    cursorUp() {
      const isEmpty = this.$ace.value?.session.selection.isEmpty();
      this.$ace.value?.session.selection.moveCursorUp();

      if (isEmpty) {
        this.$ace.value?.clearSelection();
      }
    },
    cursorDown() {
      const isEmpty = this.$ace.value?.session.selection.isEmpty();
      this.$ace.value?.session.selection.moveCursorDown();

      if (isEmpty) {
        this.$ace.value?.clearSelection();
      }
    },
    cursorLeft() {
      const isEmpty = this.$ace.value?.session.selection.isEmpty();
      this.$ace.value?.session.selection.moveCursorLeft();

      if (isEmpty) {
        this.$ace.value?.clearSelection();
      }
    },
    cursorRight() {
      const isEmpty = this.$ace.value?.session.selection.isEmpty();
      this.$ace.value?.session.selection.moveCursorRight();

      if (isEmpty) {
        this.$ace.value?.clearSelection();
      }
    },
    openCommand() {
      console.log("open command");
    },
    openBot() {
      console.log("open bot");
    },
    toggleLock() {
      this.isLock = !this.isLock;
    },
    toolsNext() {
      this.tabToolsBottom = 1;
    },
    toolsPrev() {
      this.tabToolsBottom = 0;
    },
    undo() {
      this.$ace.value?.undo();
    },
    redo() {
      this.$ace.value?.redo();
    },
    selectAll() {
      this.$ace.value?.selectAll();
    },
    async copy() {
      const string = this.$ace.value?.getCopyText();
      this.$ace.value?.execCommand("copy");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async cut() {
      const string = this.$ace.value?.getCopyText();
      this.$ace.value?.execCommand("cut");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async paste() {
      const { type, value } = await Clipboard.read();

      if (type === "text/plain") {
        this.$ace.value?.execCommand("paste", value);
      }
    },

    formatCode() {
      if (this.$ace.value) {
        const code = this.$ace.value.getValue();

        this.$ace.value.setValue(
          format(code, {
            parser:
              this.parser.parsers[0] === "babel"
                ? "babel-flow"
                : this.parser.parsers[0],
            plugins: [
              parserAngular,
              parserBabel,
              parserEspress,
              parserFlow,
              parserGraphql,
              parserHTML,
              parserMarkdown,
              parserMeriyah,
              parserPostCSS,
              parserTypescript,
              parserYaml,
            ],
          })
        );
        this.$ace.value.clearSelection();
      }
    },
    nextError() {
      if (this.$ace.value) {
        if (this.nextError) {
          this.$ace.value.moveCursorTo(
            this.nextError.row || 0,
            this.nextError.column || 0
          );
        }
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.Editor-Code {
  flex: 1;
}

.bottom-tools {
  background-color: #0e0e0e !important;
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
    padding: 0 5px;
    color: #b7b9c3;
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
</style>

<style lang="scss">
.menu-tools-addons {
  width: 100%;
  top: auto !important;
  left: 0 !important;
  bottom: 41px !important;
}
</style>

<style lang="scss" scoped>
.addons {
  background-color: #222;
  box-shadow: 0 -1px 2px rgb(0 0 0 / 10%);
  border: none;
  width: 100%;
  color: #d3d4da;
  padding: 8px 16px;

  .item {
    display: block;
    text-decoration: none;
    padding: 0.25em 1.5em;
    color: #b9bbc1;

    span {
      margin-left: 12px;
    }
  }
}
</style>
