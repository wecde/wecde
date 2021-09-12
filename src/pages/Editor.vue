<template>
  <App-Hammer>
    <div class="session mr-2" ref="sessionWrapper">
      <Session-Item
        v-for="item in meta?.['sessions']"
        :key="store.state.editor.project + item"
        :fullpath="join(store.state.editor.project, item)"
        @goto-me="scrollSessionWrapperToSessionActive"
      />
    </div>

    <div class="buttons-task-bar">
      <span data-id="code.btn-addons" />

      <q-btn
        flat
        round
        icon="mdi-play"
        padding="xs"
        @click="serverIsRunning = true"
      />
    </div>
  </App-Hammer>

  <div class="absolute fit" style="height: calc(100% - 50px) !important">
    <!-- padding-top offset for navbar -->
    <template v-if="fullpath">
      <Editor-SVG :fullpath="fullpath" v-if="isSvg(fullpath)" />
      <Editor-Markdown :fullpath="fullpath" v-else-if="isMarkdown(fullpath)" />
      <Preview :fullpath="fullpath" v-else-if="allowPreview(fullpath)" />
      <Editor-Code
        :fullpath="fullpath"
        v-else-if="!isBinaryPath(fullpath.value)"
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
import AppHammer from "components/App/Hammer.vue";
import EditorCode from "components/Editor/Code.vue";
import EditorMarkdown from "components/Editor/Markdown.vue";
import EditorSVG from "components/Editor/SVG.vue";
import SessionItem from "components/Editor/SessionItem.vue";
import Preview from "components/Preview.vue";
import isBinaryPath from "is-binary-path-cross";
import { btoa } from "js-base64";
import fs from "modules/fs";
import { join } from "path-cross";
import { createMetadata } from "src/helpers/createMetadata";
import { allowPreview, isMarkdown, isSvg } from "src/helpers/is-file-type";
import { useFullpathFromRoute } from "src/helpers/useFullpathFromRoute";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const i18n = useI18n();
const store = useStore();
const router = useRouter();

const {
  meta,
  setupMetadata,
  fullpathSessionNow: fullpath,
} = createMetadata(computed<string | null>(() => store.state.editor.project));

watch(
  fullpath,
  () => {
    void router.replace({
      name: "editor",
      query: {
        data: btoa(
          JSON.stringify({
            fullpath: fullpath.value,
          })
        ),
      },
    });
  },
  {
    immediate: true,
  }
);
watch(
  useFullpathFromRoute(),
  async (fullpath) => {
    await setupMetadata;

    if (fullpath && meta.value) {
      const filepath: string = fs.relative(
        store.state.editor.project || "",
        fullpath
      );

      if (!meta.value["sessions"]) {
        // eslint-disable-next-line functional/immutable-data
        meta.value["sessions"] = [];
      }
      // eslint-disable-next-line functional/no-let
      let indexFilepathInSessions = meta.value["sessions"].indexOf(filepath);
      if (indexFilepathInSessions === -1) {
        indexFilepathInSessions =
          // eslint-disable-next-line functional/immutable-data
          (meta.value["sessions"] as string[]).push(filepath) - 1;
      }

      if (!meta.value["session-history"]) {
        // eslint-disable-next-line functional/immutable-data
        meta.value["session-history"] = [];
      }
      if (
        meta.value["session-history"][
          meta.value["session-history"].length - 1
        ] !== indexFilepathInSessions
      ) {
        // eslint-disable-next-line functional/immutable-data
        meta.value["session-history"].push(indexFilepathInSessions);
      }
    }
  },
  {
    immediate: true,
  }
);

const serverIsRunning = ref<boolean>(false);

async function startServer(): Promise<void> {
  await WebServer.start(Number(store.state.settings["preview**port"])).catch(
    (err: unknown) => console.log(err)
  );

  void Toast.show({
    text: i18n.t("alert.webserver.start-at", {
      port: store.state.settings["preview**port"] as number,
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
    text: i18n.t("alert.webserver.stoped"),
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

const sessionWrapper = ref<Element | null>(null);
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
watch(() => meta.value?.["sessions"], () => void scrollSessionWrapperToSessionActive(), {
  deep: true
})
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
