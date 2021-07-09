<template>
  <div class="fill-height">
    <app-hammer>
      <div class="session mr-1" ref="sessionWrapper">
        <div
          class="session--item"
          v-for="item in $store.state.editor.sessions"
          :key="item"
          :class="{
            active: item === $store.state.editor.session,
          }"
          v-ripple
          @click="$store.commit(`editor/changeSession`, item)"
        >
          <img
            :src="
              getIcon({
                light: false,
                isFolder: false,
                name: basename(item),
                language: extname(item),
              })
            "
          />
          {{ basename(item) }}
          <v-icon
            size="inherit"
            class="times"
            @click.prevent.stop="$store.commit(`editor/removeSession`, item)"
          >
            mdi-close
          </v-icon>
        </div>
      </div>
      <v-icon v-if="!previewMd && isPlainText(file)">mdi-magnify</v-icon>
      <v-icon
        v-if="type === `markdown`"
        @click="previewMd = !previewMd"
        class="ml-2"
        >{{
          previewMd
            ? "mdi-square-edit-outline"
            : "mdi-language-markdown-outline"
        }}</v-icon
      >
      <v-icon
        color="#0dbf7f"
        class="ml-2"
        @click="serverStatus = !serverStatus"
        >{{
          serverLoading
            ? "mdi-loading mdi-spin"
            : serverStatus
            ? "mdi-pause"
            : "mdi-play"
        }}</v-icon
      >
      <app-web-view
        ref="WebView"
        :port="port"
        :value="serverStatus && !serverLoading"
      >
        <template v-slot:fab="{ on }">
          <v-icon
            class="ml-2"
            color="decoration"
            :style="{
              opacity: serverStatus && !serverLoading ? 1 : 0.5,
            }"
            :disabled="!serverStatus || serverLoading"
            v-on="on"
            >mdi-web</v-icon
          >
        </template>
      </app-web-view>
    </app-hammer>

    <div class="editor--wrapper dark" v-show="!previewMd">
      <div
        ref="editor"
        class="editor"
        v-if="isPlainText(file)"
        :style="{
          'font-size': `${$store.state.settings.editor.fontSize}px`,
          'font-family': `${$store.state.settings.editor.font}`,
        }"
      />

      <div v-else-if="type === `image`">
        <img :src="`data:image/${ext};base64,${base64}`" alt="" />
      </div>
      <div v-else-if="type === `video`">
        <video :src="`data:video/${ext};base64,${base64}`" alt="" />
      </div>
      <div v-else-if="type === `audio`">
        <audio :src="`data:audio/${ext};base64,${base64}`" alt="" />
      </div>
    </div>
    <div
      class="preview--markdown"
      v-if="type === `markdown` && previewMd"
      v-html="marked(rawText(base64))"
    />
  </div>
</template>

<script>
import AppHammer from "@/components/AppHammer";
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
import { readFile, writeFile } from "@/modules/filesystem";
import { fileExtensions } from "@/assets/extensions/material-icon-theme/dist/material-icons";
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
  onBeforeMount,
} from "@vue/composition-api";
import { isPlainText, getType, extname, rawText } from "@/utils";
import $store from "@/store";
import $router from "@/plugins/router";
import $i18n from "@/plugins/i18n";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon.js";
import { basename } from "path";
import marked from "marked";
import { WebServer } from "@/modules/webserver";
import AppWebView from "@/components/AppWebView";
import { Toast } from "@capacitor/toast";

export default defineComponent({
  components: {
    AppHammer,
    AppWebView,
  },
  setup() {
    const base64 = ref(null);
    const file = computed(() => $store.state.editor.session);
    const ext = computed(() => extname(file.value));
    const type = computed(() => getType(file.value));

    const editor = ref(null);
    const WebView = ref(null);

    const serverStatus = ref(false);
    const serverLoading = ref(false);
    const port = computed(() => $store.state.settings.preview.port);

    const sessionWrapper = ref(null);

    const $ace = {
      value: null,
    };
    let isMounted = false;

    onMounted(() => void (isMounted = true));

    let timeoutSaveFile;
    const watchersSettingAce = [];

    function createEditor() {
      $ace.value = ace.edit(editor.value);

      clearTimeout(timeoutSaveFile);
      $ace.value.session.on("change", () => {
        clearTimeout(timeoutSaveFile);

        timeoutSaveFile = setTimeout(
          async () => void (await writeFile(file.value, $ace.value.getValue())),
          100
        );

        scrollSessionWrapperToSessionActive();
      });

      $ace.value.setOptions({
        enableLinking: true,
        autoScrollEditorIntoView: true,
        enableSnippets: true,
        // enableEmmet: true,
        // enableCodeLens: true,
      });

      $ace.value.setTheme(`${$store.state.settings.appearance.theme}`);
      $ace.value.setOption(
        "enableBasicAutocompletion",
        $store.state.settings.editor.autocomplete
      );
      $ace.value.setOption(
        "enableLiveAutocompletion",
        $store.state.settings.editor.autocomplete
      );
      $ace.value.setKeyboardHandler(
        // eslint-disable-next-line no-extra-boolean-cast
        !!$store.state.settings.editor.keybinding
          ? `ace/keyboard/${$store.state.settings.editor.keybinding}`
          : null
      );
      $ace.value.setOption(
        "showGutter",
        $store.state.settings.editor.lineNumber
      );
      $ace.value.setShowPrintMargin(
        +$store.state.settings.editor.printMargin > 0
      );
      $ace.value.setPrintMarginColumn(
        +$store.state.settings.editor.printMargin
      );
      $ace.value.setShowInvisibles($store.state.settings.editor.showInvisible);
      $ace.value.session.setUseSoftTabs(
        $store.state.settings.editor.useSoftTabs
      );
      $ace.value.session.setTabSize(+$store.state.settings.editor.tabSize);
      $ace.value.session.setUseWrapMode($store.state.settings.editor.wordWrap);
    }
    function removeEditor() {
      if ($ace.value) {
        $ace.value.destroy();
        $ace.value = null;
        watchersSettingAce.splice(0).forEach((watcher) => void watcher());
      }
    }

    function beautifyCode() {
      beautify.beautify($ace.value.session);
    }

    watch(
      file,
      async (newValue, oldValue) => {
        if (!newValue) {
          return;
        }

        if (oldValue && $ace.value) {
          $store.commit("storeScroll/setStore", {
            file: oldValue,
            value: {
              x: $ace.value.session.getScrollLeft(),
              y: $ace.value.session.getScrollTop(),
            },
          });
        }

        if (newValue) {
          base64.value = await readFile(newValue);
        }

        if (isPlainText(file.value)) {
          const init = () => {
            createEditor();

            $ace.value.setValue(atob(base64.value));
            $ace.value.clearSelection();

            setTimeout(() => {
              const { x, y } = $store.state.storeScroll.store[file.valueF] || {
                x: 0,
                y: 0,
              };

              $ace.value.session.setScrollLeft(x);
              $ace.value.session.setScrollTop(y);
            }, 70);

            const ext = extname(file.value);
            const language =
              ext === "vue" ? "html" : fileExtensions[ext] || "text";
            $ace.value.session.setMode(`ace/mode/${language}`);
            ace.require(`ace/snippets/${language}`);
          };

          if (isMounted) {
            init();
          } else {
            onMounted(() => init());
          }
        } else {
          removeEditor();
        }
      },
      {
        immediate: true,
      }
    );

    onBeforeMount(() => {
      if (!file) {
        $router.push("/");
      }
    });

    watch(
      file,
      (newValue) => {
        if (!newValue) {
          $router.push("/");
        }
      },
      {
        immediate: true,
      }
    );

    async function startServer(port) {
      await WebServer.start(port).catch((err) => console.log(err));

      Toast.show({
        text: $i18n.t(`WebServer started on port {port}`, {
          port,
        }),
      });
      await WebView.value.openWebView();
    }
    async function stopServer() {
      await WebServer.stop();

      Toast.show({
        text: $i18n.t(`WebServer closed`),
      });
    }
    async function changePort(port) {
      await stopServer();
      await startServer(port);
    }

    watch(serverStatus, async (newValue) => {
      serverLoading.value = true;
      try {
        if (newValue) {
          await startServer(+$store.state.settings.preview.port);
          // await openWebView();
        } else {
          await stopServer();
        }
      } catch (err) {
        console.error(err);
      }
      serverLoading.value = false;
    });
    watch(port, async (newValue) => {
      serverLoading.value = true;
      if (serverStatus.value) {
        await changePort(newValue);
      }
      serverLoading.value = false;
    });

    function scrollSessionWrapperToSessionActive() {
      const wrapper = sessionWrapper.value;
      const active = wrapper.querySelector(".active");

      wrapper.scrollTo(active.offsetLeft, 0);
    }

    watch(
      file,
      (newValue) => {
        if (newValue) {
          if (isMounted) {
            scrollSessionWrapperToSessionActive();
          } else {
            onMounted(() => void scrollSessionWrapperToSessionActive());
          }
        }
      },
      {
        immediate: true,
      }
    );

    return {
      tab: ref(null),
      file,
      ext,
      basename,
      type,
      base64,
      $ace,
      editor,
      getIcon,
      previewMd: ref(false),
      marked,
      rawText,
      serverStatus,
      beautifyCode,
      port,
      serverLoading,
      sessionWrapper,
      WebView,
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
  methods: {
    isPlainText,
    extname,
  },
});
</script>

<style lang="scss" scoped>
.editor--wrapper,
.preview--markdown {
  position: relative;
  width: 100%;
  height: 100%;
}
.editor--wrapper {
  > div {
    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .editor {
    width: 100%;
    height: 100%;
  }

  img {
    max-width: 100%;
  }
  video {
    width: 100%;
  }
}
.preview--markdown {
  margin: 15px 10px;
  overflow: scroll;
}
</style>

<style lang="scss" scoped>
.session {
  flex: 1;
  width: 100%;
  overflow: scroll hidden;
  display: flex;
  min-height: 70%;
  font-size: 14px;
  position: relative;
  margin: auto 0;
  overflow-x: auto;
  user-select: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &--item {
    padding: 7px 7px 7px 9px;
    height: 100%;
    cursor: pointer;

    // background-color: rgba($color: #2c2c2c, $alpha: 1);
    transition: background-color 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);
    white-space: nowrap;
    &:hover {
      background-color: rgba($color: #383838, $alpha: 0.3);
      opacity: 1;
      .times {
        opacity: 1;
      }
    }
    &.active {
      opacity: 1;
      background-color: #383838;
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: rgba(0, 132, 255, 0.645);
      }
      .times {
        opacity: 1;
      }
    }
    position: relative;
    margin-right: 0;
    display: flex;
    align-items: center;
    img {
      display: inline-block;
      width: 1.3em;
      height: 1.3em;
      margin-right: 3px;
    }
    // &:first-child {
    //   margin-right: 0;
    // }
    // opacity: .8;
    .times {
      margin-left: 3px;
      margin-top: 3px;
      // opacity: 0.3;
    }
  }
}
</style>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
</style>
