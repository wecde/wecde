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
        <q-icon :name="mdiKeyboardTab" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorUp">
        <q-icon :name="mdiChevronUp" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorDown">
        <q-icon :name="mdiChevronDown" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cursorLeft">
        <q-icon :name="mdiChevronLeft" />
      </div>
      <div
        class="item"
        v-ripple
        @mousedown="fixBlurEditor"
        @click="cursorRight"
      >
        <q-icon :name="mdiChevronRight" />
      </div>
      <div
        class="item"
        v-ripple
        @mousedown="fixBlurEditor"
        @click="openCommand"
      >
        <q-icon :name="mdiAppleKeyboardCommand" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="openBot">
        <q-icon :name="mdiRobot" />
      </div>
      <div
        class="item"
        v-ripple
        @mousedown="fixBlurEditor"
        @click="toggleLock"
        :class="{
          'text-blue': isLock,
        }"
      >
        <q-icon :name="mdiLockOutline" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="toolsNext">
        <q-icon :name="mdiChevronDoubleRight" />
      </div>
    </div>
    <div
      class="bottom-tools__group justify-between"
      v-else-if="tabToolsBottom === 1"
    >
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="toolsPrev">
        <q-icon :name="mdiChevronDoubleLeft" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="undo">
        <q-icon :name="mdiUndoVariant" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="redo">
        <q-icon :name="mdiRedoVariant" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="selectAll">
        <q-icon :name="mdiSelectAll" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="copy">
        <q-icon :name="mdiContentCopy" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="cut">
        <q-icon :name="mdiContentCut" />
      </div>
      <div class="item" v-ripple @mousedown="fixBlurEditor" @click="paste">
        <q-icon :name="mdiContentPaste" />
      </div>

      <div class="item" v-ripple @mousedown="fixBlurEditor">
        <q-icon :name="mdiPlus" />
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
                  <q-icon size="13px" :name="mdiFormatAlignRight" />
                  <span>{{ $t("label.format") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown="fixBlurEditor"
                  @click="findAll"
                >
                  <q-icon size="13px" :name="mdiMagnify" />
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
                  <q-icon size="13px" :name="mdiChevronDownCircleOutline" />
                  <span>{{ $t("label.next-error") }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="item" v-ripple>
                  <q-icon size="13px" :name="mdiLightningBoltOutline" />
                  <span>{{ $t("label.definition") }}</span>
                </div>
                <div class="item" v-ripple>
                  <q-icon size="13px" :name="mdiCommentProcessingOutline" />
                  <span>{{ $t("label.signature") }}</span>
                </div>
                <div class="item" v-ripple>
                  <q-icon size="13px" :name="mdiInformationVariant" />
                  <span>{{ $t("label.show-info") }}</span>
                </div>
              </div>
            </div>
          </q-card>
        </q-menu>
      </div>
    </div>
  </q-footer>
  <div class="full-height" ref="EditorCode" v-show="show" />
</template>

<script lang="ts">
// eslint-disable-next-line import/order
import Ace from "ace-builds";
// eslint-disable-next-line import/order
import {
  computed,
  defineComponent,
  onBeforeUnmount,
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
// eslint-disable-next-line import/order
import fs from "modules/fs";
// eslint-disable-next-line import/order
import { useStore } from "src/store";
// eslint-disable-next-line import/order
import { createTimeoutBy, getLanguageFile } from "src/utils";

// eslint-disable-next-line import/order
import { Clipboard } from "@capacitor/clipboard";

// eslint-disable-next-line import/order
import { getSupportInfo } from "prettier";
import {
  mdiAppleKeyboardCommand,
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiChevronDown,
  mdiChevronDownCircleOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiCommentProcessingOutline,
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiFormatAlignRight,
  mdiInformationVariant,
  mdiKeyboardTab,
  mdiLightningBoltOutline,
  mdiLockOutline,
  mdiMagnify,
  mdiPlus,
  mdiRedoVariant,
  mdiRobot,
  mdiSelectAll,
  mdiUndoVariant,
} from "@quasar/extras/mdi-v5";
import { extname } from "path-cross";
import type { SupportLanguage } from "prettier";
import { usePrettierWorker} from "src/worker/prettier";

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
    const typeEditor = computed<string>(
      () => getLanguageFile(fullpath.value) || "text"
    );
    const EditorCode = ref<HTMLElement | null>(null);
    const isLock = ref<boolean>(false);
    const ace: {
      value: Ace.Ace.Editor | null;
    } = {
      value: null,
    };
    const aceInfo = ref<{
      row: number;
      column: number;
    } | null>(null);
    const nextErrorer = ref<Ace.Ace.Annotation | null>(null);

    function savePostionEditor(): void {
      store.commit("editor/setScrollEnhance", {
        file: fullpath.value,
        value: {
          x: ace.value?.session.getScrollLeft() || 0,
          y: ace.value?.session.getScrollTop() || 0,
          cursorRow: ace.value?.getCursorPosition()?.row || 0,
          cursorColumn: ace.value?.getCursorPosition()?.column || 0,
        },
      });
    }

    function createEditor() {
      if (EditorCode.value) {
        ace.value = Ace.edit(EditorCode.value);

        ace.value.on("change", () => {
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
        });
        ace.value.session.on("changeScrollTop", () => void savePostionEditor());
        ace.value.session.on(
          "changeScrollLeft",
          () => void savePostionEditor()
        );
        ace.value.session.selection.on(
          "changeCursor",
          () => void savePostionEditor()
        );
        ace.value.session.selection.on("changeCursor", () => {
          aceInfo.value = {
            row: ace.value?.getCursorPosition()?.row || 0,
            column: ace.value?.getCursorPosition()?.column || 0,
          };
        });

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
          typeEditor,
          () => {
            if (ace.value) {
              ace.value.session.setMode(`ace/mode/${typeEditor.value}`);
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
          ace.value?.setReadOnly(newValue);
        },
        {
          immediate: true,
        }
      );

      watch(fullpath, () => void savePostionEditor());

      watch(
        fullpath,
        async (newValue) => {
          // eslint-disable-next-line functional/no-let
          let raw;
          try {
            raw = await fs.readFile(newValue, "utf8");
          } catch {
            raw = "";
          }

          if (ace.value && ace.value.getValue() !== raw) {
            const { x, y, cursorRow, cursorColumn } = store.state.editor
              .scrollEnhance[fullpath.value] || {
              x: 0,
              y: 0,
              cursorRow: 0,
              cursorColumn: 0,
            };

            ace.value.setValue(raw);
            ace.value.clearSelection();

            createTimeoutBy(
              "editor.code.fix-async-scroll-behavior",
              () => {
                ace.value?.session.setScrollLeft(x);
                ace.value?.session.setScrollTop(y);
                ace.value?.moveCursorTo(cursorRow, cursorColumn);
              },
              1
            );

            Ace.require(`ace/snippets/${typeEditor.value}`);
          }
        },
        {
          immediate: true,
        }
      );
    });

    function removeEditor() {
      if (ace.value) {
        ace.value.destroy();
        ace.value = null;
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

      ace,
      EditorCode,
      isLock,
      tabToolsBottom: ref<number>(0),
      typeEditor,
      aceInfo,
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

<style lang="scss" scoped>
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
