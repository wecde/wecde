<template>
  <div class="Editor-Code" ref="EditorCode" />
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
import { beautify } from "ace-builds/src-noconflict/ext-beautify";
import { getEditor, rawText } from "@/utils";
import { readFile, writeFile } from "@/modules/filesystem";
import store from "@/store";

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

    const typeEditor = computed<string>(
      () => getEditor(fullpath.value) || "text"
    );

    const EditorCode = ref<HTMLElement | null>(null);

    const $ace: {
      value: any; // ace.Ace.Editor | null;
    } = {
      value: null,
    };

    let timeoutSaveFile: any;

    function createEditor() {
      if (EditorCode.value) {
        $ace.value = ace.edit(EditorCode.value);

        clearTimeout(timeoutSaveFile);

        $ace.value.session.on("change", () => {
          clearTimeout(timeoutSaveFile);

          timeoutSaveFile = setTimeout(
            async () =>
              void (await writeFile(fullpath.value, $ace.value.getValue())),
            100
          );

          emit("change");
        });

        $ace.value.setOptions({
          enableLinking: true,
          autoScrollEditorIntoView: true,
          enableSnippets: true,
          // enableEmmet: true,
          // enableCodeLens: true,
        });

        $ace.value.setTheme(`${store.state.settings.appearance.theme}`);
        $ace.value.setOption(
          "enableBasicAutocompletion",
          store.state.settings.editor.autocomplete
        );
        $ace.value.setOption(
          "enableLiveAutocompletion",
          store.state.settings.editor.autocomplete
        );
        $ace.value.setKeyboardHandler(
          // eslint-disable-next-line no-extra-boolean-cast
          !!store.state.settings.editor.keybinding
            ? `ace/keyboard/${store.state.settings.editor.keybinding}`
            : null
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

      watch(fullpath, async (newValue, oldValue) => {
        /// save offset oldValue
        store.commit("storeScroll/setStore", {
          file: oldValue,
          value: {
            x: $ace.value.session.getScrollLeft(),
            y: $ace.value.session.getScrollTop(),
          },
        });
      });

      watch(
        base64,
        (newValue) => {
          if ($ace.value) {
            const { x, y } = store.state.storeScroll.store[fullpath.value] || {
              x: 0,
              y: 0,
            };

            $ace.value.setValue(rawText(newValue || ""));
            $ace.value.clearSelection();

            setTimeout(() => {
              $ace.value.session.setScrollLeft(x);
              $ace.value.session.setScrollTop(y);
            }, 1);

            $ace.value.session.setMode(`ace/mode/${typeEditor.value}`);
            ace.require(`ace/snippets/${typeEditor.value}`);
          }
        },
        {
          immediate: true,
        }
      );
    });

    function removeEditor() {
      if ($ace.value) {
        /// ? save offset before destroy
        store.commit("storeScroll/setStore", {
          file: fullpath.value,
          value: {
            x: $ace.value.session.getScrollLeft(),
            y: $ace.value.session.getScrollTop(),
          },
        });

        $ace.value.destroy();
        $ace.value = null;
      }
    }

    onBeforeUnmount(() => void removeEditor());

    return {
      $ace,
      EditorCode,
      beautifyCode() {
        beautify.beautify($ace.value.session);
      },
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
          this.$ace.value.setOption("enableBasicAutocompletion", newValue);
          this.$ace.value.setOption("enableLiveAutocompletion", newValue);
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
});
</script>

<style lang="scss" scoped>
.Editor-Code {
  padding-bottom: 150px;
}
</style>
