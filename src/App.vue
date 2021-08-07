<template>
  <router-view v-if="ready" />
  <div
    v-else
    class="
      full-width full-height
      flex flex-column
      justify-center
      items-center
      text-center
    "
  >
    <div>
      <img
        width="160px"
        height="160px"
        :src="require('src/assets/favicon.svg')"
      />
    </div>
    <div>
      <h1 class="app--name">Shin Code Editor</h1>

      <div
        class="progress mt-3"
        v-if="status"
        style="height: calc(1.5em + 4px)"
      >
        <q-progress-linear rounded color="cyan" :value="status.value" />
        <span class="progress-status-text text-caption">{{
          status.status
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Filesystem } from "@capacitor/filesystem";
import { setI18nLanguage } from "boot/i18n";
import { useQuasar } from "quasar";
import { stat } from "src/modules/filesystem";
import { useStore } from "src/store";
import { isDark as themeIsDark } from "src/store/settings/options support/ace-themes";
import { defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  setup() {
    const i18n = useI18n();

    setI18nLanguage("en");

    const ready = ref<boolean>(false);
    const status = ref<{
      value: number;
      status: string;
    } | null>(null);

    const store = useStore();
    const progress: {
      message: string;
      handler: {
        (): Promise<true | string>;
      };
    }[] = [
      {
        message: i18n.rt("preload.loading-resources"),
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
        message: i18n.rt("preload.checking-last-session"),
        async handler() {
          if (store.state.editor.project) {
            try {
              if (
                (await stat(store.state.editor.project)).type !== "directory"
              ) {
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
        message: i18n.rt("preload.checking-permission"),
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
      // eslint-disable-next-line @typescript-eslint/no-for-in-array, functional/no-loop-statement
      for (const task in progress) {
        status.value = {
          value: (+task / progress.length) * 100,
          status: progress[task].message,
        };

        await progress[task].handler();
      }

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
  src: url(~src/assets/fonts/Orbitron.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

.app--name {
  font-family: Orbitron;
  font-size: 1.35rem;
  letter-spacing: 3px;
}
</style>
