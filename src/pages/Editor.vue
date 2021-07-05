<template>
  <div class="fill-height">
    <app-hammer>
      <div class="session">
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
      <v-icon v-ripple v-if="!previewMd">mdi-magnify</v-icon>
      <v-icon
        v-ripple
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
        v-ripple
        @click="serverStatus = !serverStatus"
        >{{ serverStatus ? "mdi-pause" : "mdi-play" }}</v-icon
      >
    </app-hammer>

    <div class="editor--wrapper dark" v-show="!previewMd">
      <div ref="editor" class="editor" v-if="isPlainText(file)" />

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
import { beautify } from "ace-builds/src-noconflict/ext-beautify";
import { readFile, writeFile } from "@/modules/filesystem";
import { fileExtensions } from "@/assets/extensions/material-icon-theme/dist/material-icons";
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
} from "@vue/composition-api";
import { isPlainText, getType, extname, rawText } from "@/utils";
import $store from "@/store";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon.js";
import { basename } from "path";
import marked from "marked";
import { WebServer } from "@/modules/webserver";

export default defineComponent({
  components: {
    AppHammer,
  },
  setup() {
    const base64 = ref(null);
    const file = computed(() => $store.state.editor.session);
    const ext = computed(() => extname(file.value));
    const type = computed(() => getType(file.value));
    const editor = ref(null);
    const serverStatus = ref(false);
    const port = computed(() => $store.state.settings.preview.port);

    let $ace = null;
    let isMounted = false;

    onMounted(() => void (isMounted = true));

    function setSettings() {
      if ($ace) {
        $ace.getSession().setUseWrapMode(true);
        $ace.setTheme("ace/theme/monokai");
        $ace.setOption("enableBasicAutocompletion", true);
        $ace.setOption("enableLiveAutocompletion", true);
      }
    }
    function createEditor() {
      $ace = ace.edit(editor.value);

      $ace.session.on("change", async () => {
        await writeFile(file.value, $ace.getValue());
      });

      $ace.setOptions({
        enableLinking: true,
        autoScrollEditorIntoView: true,
        // enableEmmet: true,
        // enableCodeLens: true,
      });

      $ace.session.mergeUndoDeltas = true;
    }
    function removeEditor() {
      if ($ace) {
        $ace.destroy();
        $ace = null;
      }
    }

    function beautifyCode() {
      beautify.beautify($ace.session);
    }

    watch(
      file,
      async (newValue, oldValue) => {
        if (oldValue && $ace) {
          $store.commit("storeScroll/setStore", {
            file: oldValue,
            value: {
              x: $ace.session.getScrollLeft(),
              y: $ace.session.getScrollTop(),
            },
          });
        }

        if (newValue) {
          base64.value = await readFile(newValue);
        }

        if (isPlainText(file.value)) {
          const init = () => {
            createEditor();
            setSettings();

            $ace.setValue(atob(base64.value));
            $ace.clearSelection();

            setTimeout(() => {
              const { x, y } = $store.state.storeScroll.store[file.valueF] || {
                x: 0,
                y: 0,
              };

              $ace.session.setScrollLeft(x);
              $ace.session.setScrollTop(y);
            }, 70);

            const ext = extname(file.value);
            $ace.session.setMode(
              `ace/mode/${
                ext === "vue" ? "html" : fileExtensions[ext] || "text"
              }`
            );
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

    watch(
      file,
      (newValue) => {
        if (!newValue) {
          this.$router.push("/");
        }
      },
      {
        immediate: true,
      }
    );

    async function startServer(port) {
      await WebServer.start(port).catch((err) => console.log(err));
    }
    async function stopServer() {
      await WebServer.stop();
    }
    async function changePort(port) {
      await stopServer();
      await startServer(port);
    }

    watch(serverStatus, async (newValue) => {
      if (newValue) {
        await startServer(+$store.state.settings.preview.port);
      } else {
        await stopServer();
      }
    });
    watch(port, async (newValue) => {
      if (serverStatus.value) {
        await changePort(newValue);
      }
    });

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
    };
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
