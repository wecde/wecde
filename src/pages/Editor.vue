<template>
  <App-Hammer>
    <div class="session mr-2" ref="sessionWrapper">
      <Session-Item
        v-for="(item, index) in $store.state.editor.sessions"
        :key="item"
        :fullpath="item"
        :index="index"
      />
    </div>

    <div class="buttons-task-bar">
      <q-btn
        flat
        round
        padding="xs"
        v-if="EditorCodeComponent && previewing === false"
        @click="toggleSearchBar"
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

      <q-btn
        flat
        round
        icon="mdi-play"
        padding="xs"
        @click="serverIsRunning = true"
      >
        <q-badge color="blue" floating v-if="serverIsRunning" />
      </q-btn>
    </div>
  </App-Hammer>

  <div
    class="absolute fit"
    style="height: calc(100% - 50px) !important"
    ref="wrapEditor"
  >
    <!-- padding-top offset for navbar -->
    <template v-if="fullpath">
      <Editor-SVG
        :fullpath="fullpath"
        v-if="isSvg(fullpath)"
        @change="scrollSessionWrapperToSessionActive"
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
      />
      <Editor-Code
        :fullpath="fullpath"
        v-else-if="fullpath && !isBinaryPath(fullpath.value)"
        @change="scrollSessionWrapperToSessionActive"
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

<script lang="ts" setup>
import { Browser } from "@capacitor/browser";
import { Toast } from "@capacitor/toast";
import { WebServer } from "@ionic-native/web-server";
import type { Ace } from "ace-builds";
import AppHammer from "components/App/Hammer.vue";
import EditorCode from "components/Editor/Code.vue";
import EditorMarkdown from "components/Editor/Markdown.vue";
import EditorSVG from "components/Editor/SVG.vue";
import SessionItem from "components/Editor/SessionItem.vue";
import Preview from "components/Preview.vue";
import isBinaryPath from "is-binary-path-cross";
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
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const store = useStore();
const fullpath = computed<string | null>(
  () => store.getters["editor/session"] as string | null
);

const serverIsRunning = ref<boolean>(false);
const port = computed<number>(
  () => store.state.settings["preview**port"] as number
);

async function startServer(): Promise<void> {
  await WebServer.start(Number(store.state.settings["preview**port"])).catch(
    (err: unknown) => console.log(err)
  );

  void Toast.show({
    text: i18n.t("alert.webserver-start-at", {
      port,
    }),
  });
  await Browser.open({
    url: `http://localhost:${store.state.settings["preview**port"] + ""}`,
    toolbarColor: "#212121",
    presentationStyle: "popover",
  });
}
async function stopServer() {
  await WebServer.stop();

  void Toast.show({
    text: i18n.t("alert.webserver-stoped"),
  });
}

watch(serverIsRunning, async (newValue) => {
  try {
    if (newValue) {
      await startServer();
    } else {
      await stopServer();
    }
  } catch (err) {
    console.error(err);
  }
});
watch(port, async () => {
  await stopServer();
  await startServer();
});

const sessionWrapper = ref<Element | null>(null);

// eslint-disable-next-line functional/no-let
let isMounted = false;

onMounted(() => void (isMounted = true));

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

const wrapEditor = ref<HTMLDivElement | null>(null);
function toggleSearchBar(): void {
  (
    wrapEditor.value?.querySelector("[data-id=editor]") as
      | null
      | (HTMLDivElement & {
          ace?: Ace.Editor;
        })
  )?.ace?.execCommand("find");
}

const previewing = computed<boolean>({
  get() {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      (wrapEditor.value?.querySelector("[data-id=previewer]") as any)
        ?.__vueParentComponent.ctx.previewing || false
    );
  },
  set(value) {
    if (
      wrapEditor.value &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      (wrapEditor.value?.querySelector("[data-id=previewer]") as any)
        ?.__vueParentComponent.ctx
    ) {
      const el = wrapEditor.value.querySelector("[data-id=previewer]");
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      (el as any).__vueParentComponent.ctx.previewing = value;
    }
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
