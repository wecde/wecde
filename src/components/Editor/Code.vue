<template>
  <q-footer
    style="height: 41px"
    class="bottom-tools hidden-md"
    :class="{
      dark: $q.dark.isActive,
    }"
    elevated
    v-show="!hideFooter"
  >
    <div
      class="bottom-tools__group justify-between"
      v-if="tabToolsBottom === 0"
    >
      <div class="item" v-ripple @mousedown.prevent @click="tab">
        <q-icon name="mdi-keyboard-tab" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="cursorUp">
        <q-icon name="mdi-chevron-up" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="cursorDown">
        <q-icon name="mdi-chevron-down" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="cursorLeft">
        <q-icon name="mdi-chevron-left" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="cursorRight">
        <q-icon name="mdi-chevron-right" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="openCommand">
        <q-icon name="mdi-apple-keyboard-command" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="openBot">
        <q-icon name="mdi-robot" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="toolsNext">
        <q-icon name="mdi-chevron-double-right" />
      </div>
    </div>

    <div
      class="bottom-tools__group justify-between"
      v-else-if="tabToolsBottom === 1"
    >
      <div class="item" v-ripple @mousedown.prevent @click="toolsPrev">
        <q-icon name="mdi-chevron-double-left" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="undo">
        <q-icon name="mdi-undo-variant" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="redo">
        <q-icon name="mdi-redo-variant" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="selectAll">
        <q-icon name="mdi-select-all" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="copy">
        <q-icon name="mdi-content-copy" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="cut">
        <q-icon name="mdi-content-cut" />
      </div>
      <div class="item" v-ripple @mousedown.prevent @click="paste">
        <q-icon name="mdi-content-paste" />
      </div>
      <div class="item" v-ripple @mousedown.prevent>
        <q-icon
          name="mdi-square"
          :style="{
            color: colorPalete,
          }"
        />
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          transition-show="jump-up"
          transition-hide="jump-down"
          max-width="220px"
          no-focus
          @update:model-value="$event ? void 0 : insertColor()"
        >
          <q-color format-model="hexa" v-model="colorPalete" no-footer />
        </q-menu>
      </div>

      <div class="item" v-ripple @mousedown.prevent>
        <q-icon name="mdi-plus" />
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          class="menu-addons"
          transition-show="jump-up"
          transition-hide="jump-down"
          no-focus
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
                  v-close-popup
                  @mousedown.prevent
                  @click="formatCode"
                  :style="{
                    opacity: !!parser ? 1 : 0.5,
                  }"
                  :disable="!parser"
                >
                  <q-icon size="13px" name="mdi-format-align-right" />
                  <span>{{ $t("label.format") }}</span>
                </div>
                <div class="item" v-ripple @mousedown.prevent @click="findAll">
                  <q-icon size="13px" name="mdi-magnify" />
                  <span>{{ $t("label.find-all") }}</span>
                </div>
                <div
                  class="item"
                  v-ripple
                  @mousedown.prevent
                  @click="nextError"
                  :style="{
                    opacity: !!nextErrorObject ? 1 : 0.5,
                  }"
                  :disable="!!nextErrorObject === false"
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

  <div style="height: 100%" ref="EditorCode" v-bind="$attrs" />

  <teleport to="[data-id='code.btn-addons']" v-if="isMounted">
    <q-btn
      flat
      round
      padding="xs"
      v-if="!hideFooter"
      icon="mdi-magnify"
      @click="editor.execCommand('find')"
    />
  </teleport>
</template>

<script lang="ts" setup>
// eslint-disable-next-line import/order
import ace from "ace-builds";
// eslint-disable-next-line import/order
import { computed, onMounted, ref, watch, watchEffect } from "vue";

import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-emmet";
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
import { basename, extname } from "path-cross";
import { getSupportInfo } from "prettier";
import type { SupportLanguage } from "prettier";
import { registerWatch } from "src/helpers/fs-helper";
import { useIsMounted } from "src/helpers/useIsMounted";
import { useMetadata } from "src/helpers/useMetadata";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import { usePrettierWorker } from "src/worker/prettier";

const isMounted = useIsMounted();

const props = defineProps<{
  fullpath: string;
  hideFooter?: boolean;
}>();

const filepath = computed<string>(() => {
  if (store.state.editor.project) {
    return fs.relative(store.state.editor.project, props.fullpath);
  }

  return props.fullpath;
});

const store = useStore();

const { meta: metaScroll, setupMetadata } = useMetadata("scrolling");

const colorPalete = ref<string>("#3d3636ff");
const EditorCode = ref<HTMLDivElement | null>(null);
// eslint-disable-next-line functional/no-let
let editor: ace.Ace.Editor;
const nextErrorObject = ref<ace.Ace.Annotation | null>(null);
function updateNextErrorObject() {
  const { row, column } = editor.getCursorPosition();
  const annotations = editor.session
    .getAnnotations()
    .filter((item) => item.type === "error");

  nextErrorObject.value =
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

function createBackupScrollBehavior() {
  return {
    left: editor.session.getScrollLeft() || 0,
    top: editor.session.getScrollTop() || 0,
    row: editor.getCursorPosition()?.row || 0,
    column: editor.getCursorPosition()?.column || 0,
  };
}
function restoreBackupScrollBehavior({
  left,
  top,
  row,
  column,
}: ReturnType<typeof createBackupScrollBehavior>) {
  editor.session.setScrollLeft(left);
  editor.session.setScrollTop(top);
  editor.moveCursorTo(row, column);
}

async function saveScrollBehaviorToMeta(): Promise<void> {
  await setupMetadata;

  if (metaScroll.value) {
    metaScroll.value = {
      ...(metaScroll.value || {}),
      [filepath.value]: createBackupScrollBehavior(),
    };
  }
}
async function restoreScrollBehaviorInMeta(): Promise<void> {
  if (store.state.editor.project) {
    await setupMetadata;

    restoreBackupScrollBehavior(
      metaScroll.value?.[filepath.value] || {
        top: 0,
        left: 0,
        row: 0,
        column: 0,
      }
    );
  }
}
async function loadFile(isSetup = false): Promise<void> {
  console.log("load file");

  // eslint-disable-next-line functional/no-let
  let { mode } = modelist.getModeForPath(props.fullpath);

  if (mode === "ace/mode/text") {
    switch (basename(props.fullpath)) {
      case ".prettierignore":
      case ".eslint":
        mode = "ace/mode/json";
        break;
      case "LICENSE":
        mode = "ace/mode/markdown";
        break;
    }
  }

  // > mode ready

  if (mode === "ace/mode/text") {
    editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
      enableLiveAutocompletion: false,
    });
  } else {
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
  }

  editor.setOption("useWorker", mode !== "ace/mode/jsx");
  editor.session.setMode(mode);
  ace.require(`ace/snippets/${mode as string}`);

  const raw = await fs.readFile(props.fullpath, "utf8").catch(() => "");

  if (raw !== editor.getValue()) {
    console.log("set new content file to editor");
    if (isSetup === false) {
      await saveScrollBehaviorToMeta();
    }
    editor.setValue(raw);
    editor.clearSelection();
    await restoreScrollBehaviorInMeta();
  }
}

function setupConfigaceEditor(): void {
  editor.commands.addCommand({
    name: "Format Code",
    bindKey: {
      win: "Shift-Alt-f",
      mac: "Shift-Alt-f",
    },
    exec() {
      void formatCode();
    },
  });

  editor.setOptions({
    enableLinking: true,
    autoScrollEditorIntoView: true,
    enableSnippets: true,
    enableBasicAutocompletion:
      store.state.settings["editor**autocomplete / check syntax"],
    enableLiveAutocompletion:
      store.state.settings["editor**autocomplete / check syntax"],
    useWorker: true,
    animatedScroll: false,
    tooltipFollowsMouse: false,
    enableEmmet: true,
    indentedSoftWrap: false,
    scrollPastEnd: 0.5,
    enableCodeLens: true,
  });

  ace.require("ace/ext/emmet");
  // ace.setOption("enableEmmet", true);
  editor.setHighlightSelectedWord(true);

  // ace.resize(true);
}
function watchEffectSettings(): void {
  watchEffect(() => {
    editor.setTheme(`${store.state.settings["appearance**theme"] as string}`);
    editor.setKeyboardHandler(
      !!store.state.settings["editor**keybinding"]
        ? `ace/keyboard/${store.state.settings["editor**keybinding"] as string}`
        : ""
    );
    editor.setOption(
      "showGutter",
      store.state.settings["editor**line number"] as boolean
    );
    editor.setShowPrintMargin(
      +(store.state.settings["editor**print margin"] as number) > 0
    );
    editor.setPrintMarginColumn(
      +(store.state.settings["editor**print margin"] as number)
    );
    editor.setShowInvisibles(
      store.state.settings["editor**show invisible"] as boolean
    );
    editor.session.setUseSoftTabs(
      store.state.settings["editor**use soft tabs"] as boolean
    );
    editor.session.setTabSize(
      +(store.state.settings["editor**tab size"] as number)
    );
    editor.session.setUseWrapMode(
      store.state.settings["editor**word wrap"] as boolean
    );
  });
}
// eslint-disable-next-line functional/no-let
let changedContent = false;
function watchFileInEditorAndSystem(): void {
  // eslint-disable-next-line functional/no-let
  let watcherFullpathInSystem: ReturnType<typeof registerWatch>;
  watch(
    () => props.fullpath,
    async () => {
      editor.blur();
      cancelAutoBackupScrollBehavior();

      watcherFullpathInSystem?.();
      console.log("regiser");
      watcherFullpathInSystem = registerWatch(
        props.fullpath,
        () => {
          if (changedContent) {
            changedContent = false;
            return;
          }
          createTimeoutBy(
            "watch file to load for code",
            () => loadFile(),
            1000
          );
        },
        {
          type: "file",
          mode: "absolute",
        }
      );

      await loadFile(true);

      editor.session.getUndoManager().reset();

      registerAutoBackupScrollBehavior();
    },
    {
      immediate: true,
    }
  );
}
function setupAutoSave(): void {
  editor.on("change", () => {
    createTimeoutBy(
      "auto save",
      async () => {
        const raw = await fs.readFile(props.fullpath, "utf8").catch(() => "");

        if (raw !== editor.getValue()) {
          changedContent = true;
          await fs.writeFile(props.fullpath, editor.getValue(), "utf8");
        }
      },
      1000
    );
  });
}
function registerAutoBackupScrollBehavior(): void {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  editor.session.on("changeScrollTop", saveScrollBehaviorToMeta);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  editor.session.on("changeScrollLeft", saveScrollBehaviorToMeta);

  editor.selection.on("changeCursor", saveScrollBehaviorToMeta);
}
function cancelAutoBackupScrollBehavior(): void {
  editor.session.off("changeScrollTop", saveScrollBehaviorToMeta);
  editor.session.off("changeScrollLeft", saveScrollBehaviorToMeta);
  editor.selection.off("changeCursor", saveScrollBehaviorToMeta);
}
onMounted(() => {
  if (EditorCode.value) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-implied-eval
    new Function(require("!raw-loader!emmet-core").default)(self);

    editor = ace.edit(EditorCode.value);

    setupConfigaceEditor();
    watchEffectSettings();
    watchFileInEditorAndSystem();

    setupAutoSave();
    editor.on("change", () => updateNextErrorObject());
  }
});

const tabToolsBottom = ref<0 | 1>(0);

const parser = computed<SupportLanguage | void>(() => {
  const ext = extname(props.fullpath);
  // 私©れ宛d
  return getSupportInfo().languages.find((item: SupportLanguage) => {
    return item.extensions?.some((extTest: string) => ext === extTest);
  });
});

function insertColor(): void {
  editor.session.insert(
    editor.getCursorPosition(),
    colorPalete.value.replace(/ff$/, "")
  );
}
function tab(): void {
  editor.insert("\t");
}
function cursorUp(): void {
  const isEmpty = editor.selection.isEmpty();

  if (isEmpty) {
    editor.session.selection.moveCursorUp();

    editor.clearSelection();
  } else {
    editor.session.selection.moveCursorUp();
  }
}
function cursorDown(): void {
  const isEmpty = editor.selection.isEmpty();

  if (isEmpty) {
    editor.session.selection.moveCursorDown();
    editor.clearSelection();
  } else {
    editor.session.selection.moveCursorDown();
  }
}
function cursorLeft(): void {
  const isEmpty = editor.selection.isEmpty();

  if (isEmpty) {
    editor.session.selection.moveCursorLeft();
    editor.clearSelection();
  } else {
    editor.session.selection.moveCursorLeft();
  }
}
function cursorRight(): void {
  const isEmpty = editor.selection.isEmpty();

  if (isEmpty) {
    editor.session.selection.moveCursorRight();
    editor.clearSelection();
  } else {
    editor.session.selection.moveCursorRight();
  }
}
function openCommand(): void {
  editor.execCommand("openCommandPallete");
}
function openBot(): void {
  console.log("open bot");
}
function toolsNext(): void {
  tabToolsBottom.value = 1;
}
function toolsPrev(): void {
  tabToolsBottom.value = 0;
}
function undo(): void {
  editor.undo();
}
function redo(): void {
  editor.redo();
}
function selectAll(): void {
  editor.selectAll();
}
async function copy(): Promise<void> {
  const string = editor.getCopyText();
  editor.execCommand("copy");

  if (string) {
    await Clipboard.write({
      string,
    });
  }
}
async function cut(): Promise<void> {
  const string = editor.getCopyText();
  editor.execCommand("cut");

  if (string) {
    await Clipboard.write({
      string,
    });
  }
}
async function paste(): Promise<void> {
  const { type, value } = await Clipboard.read();

  if (type === "text/plain") {
    editor.execCommand("paste", value);
  }
}

async function formatCode(): Promise<void> {
  if (parser.value) {
    const code = editor.getValue();

    editor.setValue(
      await usePrettierWorker().format(code, {
        parser:
          parser.value.parsers[0] === "babel"
            ? "babel-flow"
            : parser.value.parsers[0],
      })
    );
    editor.clearSelection();
  }
}
function nextError(): void {
  if (nextErrorObject.value) {
    editor.moveCursorTo(
      nextErrorObject.value.row || 0,
      nextErrorObject.value.column || 0
    );
  }
}
function findAll(): void {
  const keyword = editor.getCopyText();
  console.log(`find all "${keyword}`);
}
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

.ace_gutter-active-line {
  background-color: transparent;
}
</style>
