<template>
  <div class="fill-height" v-if="fullpath">
    <App-Hammer>
      <div class="session mr-1" ref="sessionWrapper">
        <div
          class="session--item"
          v-for="(item, index) in $store.state.editor.sessions"
          :key="item"
          :class="{
            active: index === $store.state.editor.session,
          }"
          v-ripple
          @click="$store.commit(`editor/changeSession`, index)"
        >
          <img
            :src="
              getIcon({
                light: false,
                isOpen: false,
                isFolder: false,
                name: basename(item),
                language: extname(item),
              })
            "
          />
          {{ basename(item) }}
          <template v-if="isPlainText(item) === false">(read only)</template>
          <v-icon
            size="inherit"
            class="times"
            @click.prevent.stop="$store.commit(`editor/removeSession`, index)"
          >
            mdi-close
          </v-icon>
        </div>
      </div>
      <v-icon v-if="plaintext">mdi-magnify</v-icon>
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
      <WebView
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
      </WebView>
    </App-Hammer>

    <div class="editor dark">
      <Preview-Font
        class="editor"
        :fullpath="fullpath"
        v-if="typeEditor === 'font'"
      />
      <Preview-Image
        class="editor"
        :fullpath="fullpath"
        v-else-if="typeEditor === 'image'"
      />
      <Preview-Video
        class="editor"
        :fullpath="fullpath"
        v-else-if="typeEditor === 'video'"
      />
      <Preview-Audio
        class="editor"
        :fullpath="fullpath"
        v-else-if="typeEditor === 'audio'"
      />
      <Editor-SVG
        class="editor"
        :fullpath="fullpath"
        :previewing="previewing"
        v-else-if="typeEditor === 'svg'"
        @change="scrollSessionWrapperToSessionActive"
      />
      <Editor-Markdown
        class="editor"
        :fullpath="fullpath"
        :previewing="previewing"
        v-else-if="typeEditor === 'markdown'"
        @change="scrollSessionWrapperToSessionActive"
      />
      <Editor-Code
        class="editor"
        :fullpath="fullpath"
        v-else-if="plaintext"
        @change="scrollSessionWrapperToSessionActive"
      />
      <div class="editor pt-4 text-caption px-6 pb-6" v-else>
        This file is not displayed in the text editor because it is either
        binary or uses an unsupported text encoding.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  computed,
  onMounted,
} from "@vue/composition-api";
import AppHammer from "@/components/App/Hammer.vue";
import { extname } from "@/utils";
import $store from "@/store";
import $router from "@/router";
import i18n from "@/i18n";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon";
import { basename } from "path";
import { WebServer } from "@/modules/webserver";
import WebView from "@/components/WebView/Index.vue";
import { Toast } from "@capacitor/toast";
import Vue from "vue";
import { isPlainText, getEditor } from "@/utils";
import PreviewFont from "@/components/Preview/Font.vue";
import PreviewImage from "@/components/Preview/Image.vue";
import PreviewVideo from "@/components/Preview/Video.vue";
import PreviewAudio from "@/components/Preview/Audio.vue";
import EditorSVG from "@/components/Editor/SVG.vue";
import EditorMarkdown from "@/components/Editor/Markdown.vue";
import EditorCode from "@/components/Editor/Code.vue";

export default defineComponent({
  components: {
    AppHammer,
    WebView,
    PreviewFont,
    PreviewImage,
    PreviewVideo,
    PreviewAudio,
    EditorSVG,
    EditorMarkdown,
    EditorCode,
  },
  setup() {
    const fullpath = computed<string>(() => $store.getters["editor/session"]);
    const typeEditor = computed<string>(
      () => getEditor(fullpath.value) || "text"
    );

    const WebView = ref<Vue | null>(null);

    const serverStatus = ref<boolean>(false);
    const serverLoading = ref<boolean>(false);
    const port = computed<string>(() => $store.state.settings.preview__port);
    const plaintext = computed<boolean>(() => isPlainText(fullpath.value));

    const sessionWrapper = ref<Element | null>(null);

    let isMounted = false;

    onMounted(() => void (isMounted = true));

    watch(
      fullpath,
      (newValue) => {
        if (!newValue) {
          $router.push("/");
        }
      },
      {
        immediate: true,
      }
    );

    async function startServer(port: string): Promise<void> {
      await WebServer.start(port).catch((err: any) => console.log(err));

      Toast.show({
        text: i18n.t(`WebServer started on port {port}`, {
          port,
        }) as string,
      });
      await (WebView.value as any).openWebView();
    }
    async function stopServer() {
      await WebServer.stop();

      Toast.show({
        text: i18n.t(`WebServer closed`) as string,
      });
    }
    async function changePort(port: string): Promise<void> {
      await stopServer();
      await startServer(port);
    }

    watch(serverStatus, async (newValue) => {
      serverLoading.value = true;
      try {
        if (newValue) {
          await startServer($store.state.settings.preview__port);
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
      setTimeout(() => {
        const wrapper = sessionWrapper.value as HTMLElement;
        const active = wrapper.querySelector(".active") as HTMLElement;

        wrapper.scrollTo(active?.offsetLeft || 0, 0);
      }, 70);
    }

    watch(
      fullpath,
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
      fullpath,
      basename,
      getIcon,
      serverStatus,
      port,
      serverLoading,
      sessionWrapper,
      WebView,
      scrollSessionWrapperToSessionActive,
      plaintext,
      typeEditor,
      previewing: ref<boolean>(false),
    };
  },
  methods: {
    extname,
    isPlainText,
  },
});
</script>

<style lang="scss" scoped>
.editor {
  position: relative;
  width: 100%;
  height: 100%;
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
