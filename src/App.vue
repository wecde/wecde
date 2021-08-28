<template>
  <q-linear-progress
    indeterminate
    round
    v-if="$store.state.system.progress"
    class="progress"
  />

  <router-view v-if="ready" />
  <div class="preload" v-else>
    <div class="flex no-wrap column justify-center items-center text-center">
      <div>
        <img :src="require('assets/favicon.svg')" />
      </div>
      <div>
        <h1 class="app--name">Shin Code Editor</h1>

        <div
          class="preload-progress mt-3"
          v-if="status"
          style="height: calc(1.5em + 4px)"
        >
          <q-linear-progress round :value="status.value" />
          <span class="progress-status-text text-caption">{{
            status.status
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Filesystem } from "@capacitor/filesystem";
import { Filesystem as cfs } from "@capacitor/filesystem";
import { loadLocaleMessages } from "boot/i18n";
import { Stat } from "capacitor-fs/src/Stat"
import git, { GitIndex, GitPackIndex } from "isomorphic-git-fast";
import http from "isomorphic-git-fast/http/web/index.js";
import fs from "modules/fs";
import { useQuasar } from "quasar";
import { configs } from "src/helpers/git";
import { cacheToJson, jsonToCache } from "src/helpers/git-cache"
import { useStore } from "src/store";
import { isDark as themeIsDark } from "src/store/settings/options support/ace-themes";
import { foreachAsync } from "src/utils";
import { useGitWorker } from "src/worker/git"
import { defineComponent, ref, watch } from "vue";

// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).fs = fs;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).cfs = cfs;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).git = git;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).configs = configs;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).http = http;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).GitPackIndex = GitPackIndex;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).GitIndex = GitIndex;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).Stat = Stat;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).cacheToJson = cacheToJson;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).jsonToCache = jsonToCache;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).useGitWorker = useGitWorker;

export default defineComponent({
  setup() {
    const store = useStore();

    watch(
      () => store.state.settings["appearance**language"],
      (newValue) => {
        void loadLocaleMessages(newValue as string);
      },
      {
        immediate: true,
      }
    );

    const ready = ref<boolean>(false);
    const status = ref<{
      value: number;
      status: string;
    } | null>(null);

    const progress: {
      message: string;
      handler: {
        (): Promise<true | string>;
      };
    }[] = [
      {
        message: "Loading resources",
        async handler() {
          if (document.readyState === "complete") {
            return true;
          }

          return new Promise<true>((resolve) => {
            window.addEventListener(
              "load",
              () => {
                resolve(true);
              },
              {
                once: true,
              }
            );
          });
        },
      },
      {
        message: "Filesystem setup",
        async handler() {
          await fs.init();

          return true;
        },
      },
      {
        message: "Checking last session",
        async handler() {
          if (store.state.editor.project) {
            try {
              if ((await fs.stat(store.state.editor.project)).isDirectory()) {
                // eslint-disable-next-line functional/no-throw-statement
                throw new Error("Last session removed");
              }
            } catch (err) {
              return "Last session removed";
            }
          }

          return true;
        },
      },
      {
        message: "Checking permissing storage",
        async handler() {
          if (
            (await Filesystem.checkPermissions()).publicStorage !== "granted"
          ) {
            await Filesystem.requestPermissions();
          }

          return true;
        },
      },
    ];

    async function init(): Promise<void> {
      await foreachAsync(progress, async (task, index, { length }) => {
        status.value = {
          value: (+index / length) * 100,
          status: task.message,
        };
        await task.handler();
      });

      status.value = {
        value: 100,
        status: "",
      };

      ready.value = true;
    }
    void init();

    const quasar = useQuasar();

    watch(
      () => store.state.settings["appearance**theme"],
      (newValue) => {
        quasar.dark.set(themeIsDark(newValue as string));
      },
      {
        immediate: true,
      }
    );

    return {
      ready,
      status,
    };
  },
});
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 0; // 8px;;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(231, 231, 231, 0.1);
  transition: background-color 0.33s cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(231, 231, 231, 0.3);
}

*:not(input, textarea, [contentediable="true"]) {
  user-select: none;
}

* {
  scrollbar-width: none;
}
</style>

<style lang="scss" scoped>
@font-face {
  font-family: "Orbitron";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(~assets/fonts/Orbitron.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

.app--name {
  font-family: Orbitron;
  font-size: 1.35rem;
  letter-spacing: 3px;
}

.progress {
  position: fixed;
  top: 0;
  z-index: 999999999999999999;
}

.preload {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  img {
    width: 160px;
    height: 160px;
  }
  h1 {
    line-height: 1.5;
  }
}
</style>
