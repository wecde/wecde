<template>
  <div class="fill-height">
    <v-bottom-navigation
      app
      fixed
      height="41"
      class="d-block order-2 bottom-tools d-md-none"
      :input-value="inputValue"
    >
      <div
        class="bottom-tools__group justify-space-between"
        v-if="tabToolsBottom === 0"
      >
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="tab"
        >
          <v-icon>{{ mdiKeyboardTab }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="cursorUp"
        >
          <v-icon>{{ mdiChevronUp }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="cursorDown"
        >
          <v-icon>{{ mdiChevronDown }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="cursorLeft"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="cursorRight"
        >
          <v-icon>{{ mdiChevronRight }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="openCommand"
        >
          <v-icon>{{ mdiAppleKeyboardCommand }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="openBot"
        >
          <v-icon>{{ mdiRobot }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="toggleLock"
          :class="{
            'blue--text': isLock,
          }"
        >
          <v-icon>{{ mdiLockOutline }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="toolsNext"
        >
          <v-icon>{{ mdiChevronDoubleRight }}</v-icon>
        </div>
      </div>
      <div
        class="bottom-tools__group justify-space-between"
        v-else-if="tabToolsBottom === 1"
      >
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="toolsPrev"
        >
          <v-icon>{{ mdiChevronDoubleLeft }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="undo"
        >
          <v-icon>{{ mdiUndoVariant }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="redo"
        >
          <v-icon>{{ mdiRedoVariant }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="selectAll"
        >
          <v-icon>{{ mdiSelectAll }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="copy"
        >
          <v-icon>{{ mdiContentCopy }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="cut"
        >
          <v-icon>{{ mdiContentCut }}</v-icon>
        </div>
        <div
          class="item"
          v-ripple
          @mousedown="fixBlurEditor"
          @touchstart="fixBlurEditor"
          @click="paste"
        >
          <v-icon>{{ mdiContentPaste }}</v-icon>
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
            <div
              class="item"
              v-ripple
              v-on="on"
              @mousedown="fixBlurEditor"
              @touchstart="fixBlurEditor"
            >
              <v-icon v-bind="attrs">{{ mdiPlus }}</v-icon>
            </div>
          </template>

          <v-card flat width="100%" class="addons">
            <v-layout>
              <v-flex>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @touchstart="fixBlurEditor"
                  @click="formatCode"
                  :style="{
                    opacity: supportFormat ? 1 : 0.5,
                  }"
                  :disabled="supportFormat === false"
                >
                  <v-icon size="1em">{{ mdiFormatAlignRight }}</v-icon>
                  <span>{{ $t("Format") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @touchstart="fixBlurEditor"
                  @click="findAll"
                >
                  <v-icon size="1em">{{ mdiMagnify }}</v-icon>
                  <span>{{ $t("Find All") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @touchstart="fixBlurEditor"
                  @click="nextError"
                  :style="{
                    opacity: !!nextErrorer ? 1 : 0.5,
                  }"
                  :disabled="!!nextErrorer === false"
                >
                  <v-icon size="1em">{{ mdiChevronDownCircleOutline }}</v-icon>
                  <span>{{ $t("Next Error") }}</span>
                </div>
              </v-flex>
              <v-flex>
                <div class="item" v-ripple>
                  <v-icon size="1em">{{ mdiLightningBoltOutline }}</v-icon>
                  <span>{{ $t("Definition") }}</span>
                </div>
                <div class="item" v-ripple>
                  <v-icon size="1em">{{ mdiCommentProcessingOutline }}</v-icon>
                  <span>{{ $t("Signature") }}</span>
                </div>
                <div class="item" v-ripple>
                  <v-icon size="1em">{{ mdiInformationVariant }}</v-icon>
                  <span>{{ $t("Show Info") }}</span>
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
import "ace-builds/src-noconflict/ext-prompt";
import { createTimeoutBy, getEditor, rawText } from "@/utils";
import { readFile, writeFile } from "@/modules/filesystem";
import store from "@/store";
import { Clipboard } from "@capacitor/clipboard";
import { extname } from "path";
import { format, getSupportInfo } from "prettier";
import {
  mdiKeyboardTab,
  mdiChevronUp,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiAppleKeyboardCommand,
  mdiRobot,
  mdiLockOutline,
  mdiChevronDoubleRight,
  mdiChevronDoubleLeft,
  mdiUndoVariant,
  mdiRedoVariant,
  mdiSelectAll,
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiPlus,
  mdiFormatAlignRight,
  mdiMagnify,
  mdiChevronDownCircleOutline,
  mdiLightningBoltOutline,
  mdiCommentProcessingOutline,
  mdiInformationVariant,
} from "@mdi/js";
// import standalone from "prettier/standalone";

let prettierPlugins: any[];
async function loadPrettierPlugins(): Promise<any[]> {
  if (!prettierPlugins) {
    console.time("load plugin prettier");
    prettierPlugins = await Promise.all([
      import("prettier/parser-angular"),
      import("prettier/parser-babel"),
      import("prettier/parser-espree"),
      import("prettier/parser-flow"),
      import("prettier/parser-graphql"),
      import("prettier/parser-html"),
      import("prettier/parser-markdown"),
      import("prettier/parser-meriyah"),
      import("prettier/parser-postcss"),
      import("prettier/parser-typescript"),
      import("prettier/parser-yaml"),
    ]);
    console.timeEnd("load plugin prettier");
  }

  return prettierPlugins;
}

export default defineComponent({
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
  },
  setup(props, { emit }) {
    const { fullpath } = toRefs(props);
    const base64 = ref<string | null>(null);
    const typeEditor = computed<string>(
      () => getEditor(fullpath.value) || "text"
    );
    const EditorCode = ref<HTMLElement | null>(null);
    const isLock = ref<boolean>(false);
    const $ace: {
      value: ace.Ace.Editor | null;
    } = {
      value: null,
    };
    const aceInfo = ref<{
      row: number;
      column: number;
    } | null>(null);
    const nextErrorer = ref<ace.Ace.Annotation | null>(null);

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

    function createEditor() {
      if (EditorCode.value) {
        $ace.value = ace.edit(EditorCode.value);

        $ace.value.on("change", () => {
          createTimeoutBy(
            "editor.code.timeout-saving-file",
            async () => {
              if ($ace.value) {
                writeFile(fullpath.value, $ace.value.getValue());

                const { row, column } = $ace.value.getCursorPosition();
                const annotations = $ace.value.session
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
        $ace.value.session.selection.on("changeCursor", () => {
          aceInfo.value = {
            row: $ace.value?.getCursorPosition()?.row || 0,
            column: $ace.value?.getCursorPosition()?.column || 0,
          };
        });

        $ace.value.setOptions({
          enableLinking: true,
          autoScrollEditorIntoView: true,
          enableSnippets: true,
          enableBasicAutocompletion: store.state.settings.editor__autocomplete,
          enableLiveAutocompletion: store.state.settings.editor__autocomplete,
          // enableEmmet: true,
          // enableCodeLens: true,
        });

        $ace.value.setTheme(`${store.state.settings.appearance__theme}`);
        $ace.value.setKeyboardHandler(
          // eslint-disable-next-line no-extra-boolean-cast
          !!store.state.settings.editor__keybinding
            ? `ace/keyboard/${store.state.settings.editor__keybinding}`
            : ""
        );
        $ace.value.setOption(
          "showGutter",
          store.state.settings.editor__lineNumber
        );
        $ace.value.setShowPrintMargin(
          +store.state.settings.editor__printMargin > 0
        );
        $ace.value.setPrintMarginColumn(
          +store.state.settings.editor__printMargin
        );
        $ace.value.setShowInvisibles(
          store.state.settings.editor__showInvisible
        );
        $ace.value.session.setUseSoftTabs(
          store.state.settings.editor__useSoftTabs
        );
        $ace.value.session.setTabSize(+store.state.settings.editor__tabSize);
        $ace.value.session.setUseWrapMode(
          store.state.settings.editor__wordWrap
        );

        watch(
          typeEditor,
          () => {
            if ($ace.value) {
              $ace.value.session.setMode(`ace/mode/${typeEditor.value}`);
            }
          },
          {
            immediate: true,
          }
        );
      }
    }

    onMounted(() => {
      createEditor();

      watch(
        isLock,
        (newValue) => {
          $ace.value?.setReadOnly(newValue);
        },
        {
          immediate: true,
        }
      );

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

          createTimeoutBy(
            "editor.code.fix-async-scroll-behavior",
            () => {
              $ace.value?.session.setScrollLeft(x);
              $ace.value?.session.setScrollTop(y);
              $ace.value?.moveCursorTo(cursorRow, cursorColumn);
            },
            1
          );

          ace.require(`ace/snippets/${typeEditor.value}`);
        }
      });

      watch(
        fullpath,
        async (newValue) => {
          try {
            base64.value = await readFile(newValue);
          } catch {
            base64.value = "";
            console.warn(`file ${newValue} not exists.`);
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
      mdiKeyboardTab,
      mdiChevronUp,
      mdiChevronDown,
      mdiChevronLeft,
      mdiChevronRight,
      mdiAppleKeyboardCommand,
      mdiRobot,
      mdiLockOutline,
      mdiChevronDoubleRight,
      mdiChevronDoubleLeft,
      mdiUndoVariant,
      mdiRedoVariant,
      mdiSelectAll,
      mdiContentCopy,
      mdiContentCut,
      mdiContentPaste,
      mdiPlus,
      mdiFormatAlignRight,
      mdiMagnify,
      mdiChevronDownCircleOutline,
      mdiLightningBoltOutline,
      mdiCommentProcessingOutline,
      mdiInformationVariant,

      $ace,
      EditorCode,
      isLock,
      tabToolsBottom: ref<number>(0),
      typeEditor,
      aceInfo,
      nextErrorer,
    };
  },

  watch: {
    "$store.state.settings.appearance__theme": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setTheme(`${newValue}`);
        }
      },
    },
    "$store.state.settings.editor__autocomplete": {
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
    "$store.state.settings.editor__keybinding": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setKeyboardHandler(`ace/keyboard/${newValue}`);
        }
      },
    },
    "$store.state.settings.editor__lineNumber": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setOption("showGutter", newValue);
        }
      },
    },
    "$store.state.settings.editor__printMargin": {
      handler(newValue) {
        if (this.$ace.value) {
          newValue = +newValue;
          this.$ace.value.setShowPrintMargin(newValue > 0);
          this.$ace.value.setPrintMarginColumn(newValue);
        }
      },
    },
    "$store.state.settings.editor__showInvisible": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.setShowInvisibles(newValue);
        }
      },
    },
    "$store.state.settings.editor__useSoftTabs": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.session.setUseSoftTabs(newValue);
        }
      },
    },
    "$store.state.settings.editor__tabSize": {
      handler(newValue) {
        if (this.$ace.value) {
          this.$ace.value.session.setTabSize(+newValue);
        }
      },
    },
    "$store.state.settings.editor__wordWrap": {
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
  },

  methods: {
    fixBlurEditor(event: any): void {
      if (event.type === "mousedown") {
        event.preventDefault();
      }
    },
    tab(): void {
      this.$ace.value?.insert("\t");
    },
    cursorUp(): void {
      const isEmpty = this.$ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.$ace.value?.session.selection.moveCursorUp();

        this.$ace.value?.clearSelection();
      } else {
        this.$ace.value?.session.selection.moveCursorUp();
      }
    },
    cursorDown(): void {
      const isEmpty = this.$ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.$ace.value?.session.selection.moveCursorDown();
        this.$ace.value?.clearSelection();
      } else {
        this.$ace.value?.session.selection.moveCursorDown();
      }
    },
    cursorLeft(): void {
      const isEmpty = this.$ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.$ace.value?.session.selection.moveCursorLeft();
        this.$ace.value?.clearSelection();
      } else {
        this.$ace.value?.session.selection.moveCursorLeft();
      }
    },
    cursorRight(): void {
      const isEmpty = this.$ace.value?.selection.isEmpty();

      if (isEmpty) {
        this.$ace.value?.session.selection.moveCursorRight();
        this.$ace.value?.clearSelection();
      } else {
        this.$ace.value?.session.selection.moveCursorRight();
      }
    },
    openCommand(): void {
      this.$ace.value?.execCommand("openCommandPallete");
    },
    openBot(): void {
      console.log("open bot");
    },
    toggleLock(): void {
      this.isLock = !this.isLock;
    },
    toolsNext(): void {
      this.tabToolsBottom = 1;
    },
    toolsPrev(): void {
      this.tabToolsBottom = 0;
    },
    undo(): void {
      this.$ace.value?.undo();
    },
    redo(): void {
      this.$ace.value?.redo();
    },
    selectAll(): void {
      this.$ace.value?.selectAll();
    },
    async copy(): Promise<void> {
      const string = this.$ace.value?.getCopyText();
      this.$ace.value?.execCommand("copy");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async cut(): Promise<void> {
      const string = this.$ace.value?.getCopyText();
      this.$ace.value?.execCommand("cut");

      if (string) {
        await Clipboard.write({
          string,
        });
      }
    },
    async paste(): Promise<void> {
      const { type, value } = await Clipboard.read();

      if (type === "text/plain") {
        this.$ace.value?.execCommand("paste", value);
      }
    },

    async formatCode(): Promise<void> {
      if (this.$ace.value) {
        const code = this.$ace.value.getValue();

        this.$ace.value.setValue(
          format(code, {
            parser:
              this.parser.parsers[0] === "babel"
                ? "babel-flow"
                : this.parser.parsers[0],
            plugins: await loadPrettierPlugins(),
          })
        );
        this.$ace.value.clearSelection();
      }
    },
    nextError(): void {
      if (this.$ace.value) {
        if (this.nextErrorer) {
          this.$ace.value.moveCursorTo(
            this.nextErrorer.row || 0,
            this.nextErrorer.column || 0
          );
        }
      }
    },
    findAll(): void {
      if (this.$ace.value) {
        const keyword = this.$ace.value.getCopyText();
        console.log(`find all "${keyword}`);
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
