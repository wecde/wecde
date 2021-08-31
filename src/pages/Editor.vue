<template>
  <App-Hammer>
    <div class="session mr-2" ref="sessionWrapper">
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
            })
          "
        />
        {{ basename(item) }}
        <!-- <template v-if="isPlainText(item) === false">(read only)</template> -->
        <q-icon
          class="times"
          name="mdi-close"
          @click.prevent.stop="$store.commit(`editor/removeSession`, index)"
        />
      </div>
    </div>

    <div class="buttons-task-bar">
      <q-btn
        flat
        round
        padding="xs"
        v-if="EditorCodeComponent && previewing === false"
        @click="toggleSearchAce"
        icon="mdi-magnify"
      />

      <q-btn
        flat
        round
        padding="xs"
        v-if="EditorPreviewComponent"
        @click="preview"
        :icon="previewing ? 'mdi-pen' : 'mdi-folder-image'"
      />

      <q-btn flat round icon="mdi-play" padding="xs">
        <q-badge color="blue" floating v-if="serverStatus" />
      </q-btn>
    </div>
  </App-Hammer>

  <div class="absolute fit" style="height: calc(100% - 50px) !important">
    <!-- padding-top offset for navbar -->
    <template v-if="fullpath">
      <Editor-SVG
        :fullpath="fullpath"
        v-if="isSvg(fullpath)"
        @change="scrollSessionWrapperToSessionActive"
        ref="editorComponent"
      />
      <Preview
        :fullpath="fullpath"
        v-else-if="
          isImage(fullpath) ||
          isVideo(fullpath) ||
          isAudio(fullpath) ||
          isFont(fullpath)
        "
      />
      <Editor-Markdown
        :fullpath="fullpath"
        v-else-if="isMarkdown(fullpath)"
        @change="scrollSessionWrapperToSessionActive"
        ref="editorComponent"
      />
      <Editor-Code
        :fullpath="fullpath"
        v-else-if="plaintext"
        @change="scrollSessionWrapperToSessionActive"
        ref="editorComponent"
      />
      <div class="q-pt-4 text-caption q-px-6 q-pb-6" v-else>
        This file is not displayed in the text editor because it is either
        binary or uses an unsupported text encoding.
      </div>
    </template>
    <template v-else>
      <img
        class="image-shallow q-mt-n9 q-px-n6"
        :src="require('assets/favicon.svg')"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Browser } from "@capacitor/browser";
import { Toast } from "@capacitor/toast";
import { WebServer } from "@ionic-native/web-server";
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import AppHammer from "components/App/Hammer.vue";
import EditorCode from "components/Editor/Code.vue";
import EditorMarkdown from "components/Editor/Markdown.vue";
import EditorSVG from "components/Editor/SVG.vue";
import Preview from "components/Preview.vue";
import isBinaryPath from "is-binary-path-cross";
import { basename } from "path-cross";
import {
  isAudio,
  isFont,
  isImage,
  isMarkdown,
  isSvg,
  isVideo,
} from "src/helpers/is-file-type";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import type { DefineComponent } from "vue";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    AppHammer,
    Preview,
    EditorSVG,
    EditorMarkdown,
    EditorCode,
  },
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const fullpath = computed<string | null>(
      () => store.getters["editor/session"] as string | null
    );

    const editorComponent = ref<DefineComponent | null>(null);

    const serverStatus = ref<boolean>(false);
    const port = computed<number>(
      () => store.state.settings["preview**port"] as number
    );
    const plaintext = computed<boolean>(() =>
      fullpath.value ? !isBinaryPath(fullpath.value) : false
    );

    const sessionWrapper = ref<Element | null>(null);

    // eslint-disable-next-line functional/no-let
    let isMounted = false;

    onMounted(() => void (isMounted = true));

    async function openWebView() {
      await Browser.open({
        url: `http://localhost:${
          store.state.settings["preview**port"] as string
        }`,
        toolbarColor: "#212121",
        presentationStyle: "popover",
      });
    }

    async function startServer(port: number): Promise<void> {
      await WebServer.start(port).catch((err: unknown) => console.log(err));

      void Toast.show({
        text: i18n.t("alert.webserver-start-at", {
          port,
        }),
      });
    }
    async function stopServer() {
      await WebServer.stop();

      void Toast.show({
        text: i18n.t("alert.webserver-stoped"),
      });
    }
    async function changePort(port: number): Promise<void> {
      await stopServer();
      await startServer(port);
    }

    watch(serverStatus, async (newValue) => {
      try {
        if (newValue) {
          await startServer(store.state.settings["preview**port"] as number);
          await openWebView();
        } else {
          await stopServer();
        }
      } catch (err) {
        console.error(err);
      }
    });
    watch(port, async (newValue) => {
      if (serverStatus.value) {
        await changePort(newValue);
      }
    });

    function openBrowser(): void {
      if (serverStatus.value) {
        try {
          void openWebView();
        } catch (err) {
          console.error(err);
        }
      } else {
        serverStatus.value = true;
      }
    }

    function scrollSessionWrapperToSessionActive() {
      createTimeoutBy(
        "pages.editor.fix-async-dom-scroll-to-tab-session-active",
        () => {
          const wrapper = sessionWrapper.value as HTMLElement;
          const active = wrapper.querySelector(".active") as HTMLElement;

          wrapper.scrollTo(active?.offsetLeft || 0, 0);
        },
        70
      );
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
      serverStatus,
      port,
      sessionWrapper,
      editorComponent,
      scrollSessionWrapperToSessionActive,
      plaintext,
      openBrowser,

      isSvg,
      isAudio,
      isFont,
      isImage,
      isVideo,
      isMarkdown,
    };
  },
  computed: {
    EditorCodeComponent(): DefineComponent | null {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/no-let
      let EditorCodeComponent: any = this.editorComponent;

      // eslint-disable-next-line functional/no-loop-statement
      while (
        EditorCodeComponent &&
        EditorCodeComponent?.$options.name !== "Editor-Code"
      ) {
        EditorCodeComponent = EditorCodeComponent.codeEditor ?? null;
      }

      return EditorCodeComponent?.$options.name === "Editor-Code"
        ? EditorCodeComponent
        : null;
    },
    EditorPreviewComponent(): DefineComponent | null {
      // eslint-disable-next-line functional/no-let, @typescript-eslint/no-explicit-any
      let EditorPreviewComponent: any = this.editorComponent;

      // eslint-disable-next-line functional/no-loop-statement
      while (
        EditorPreviewComponent &&
        EditorPreviewComponent?.$options.name.startsWith("Editor-Preview-") ===
          false
      ) {
        EditorPreviewComponent = EditorPreviewComponent.codeEditor ?? null;
      }

      return EditorPreviewComponent?.$options.name.startsWith("Editor-Preview-")
        ? EditorPreviewComponent
        : null;
    },
    previewing: {
      get(): boolean {
        return !!(
          this.EditorPreviewComponent &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.EditorPreviewComponent as any).previewing
        );
      },
      set(value: boolean): void {
        this.EditorPreviewComponent &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
          ((this.EditorPreviewComponent as any).previewing = value);
      },
    },
  },
  methods: {
    getIcon,
    basename,

    toggleSearchAce(): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.EditorCodeComponent as any)?.ace.value?.execCommand("find");
    },
    preview(): void {
      this.previewing = !this.previewing;
    },
  },
});
</script>

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

.buttons-task-bar {
  > * {
    margin-left: 8px;
    &:first-child {
      margin-left: 0;
    }
  }
}

.image-shallow {
  filter: grayscale(100%);
  position: relative;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  max-width: 230px;
}
</style>
