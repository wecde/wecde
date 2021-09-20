<template>
  <div class="preload">
    <div class="flex no-wrap column justify-center items-center text-center">
      <div>
        <img :src="require('assets/favicon.svg')" />
      </div>
      <div>
        <h1 class="app--name">Wecde</h1>

        <div
          class="preload-progress mt-3"
          v-if="status"
          style="height: calc(1.5em + 4px)"
        >
          <q-linear-progress round :value="status.progress" />
          <span class="progress-status-text text-caption">{{
            status.message
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Filesystem } from "@capacitor/filesystem";
import fs from "src/modules/fs";
import { foreachAsync } from "src/utils";
import { ref } from "vue";

const emit = defineEmits<{
  (event: "done"): void;
}>();

const status = ref<{
  progress: number;
  message: string;
}>({
  progress: 0,
  message: "Setuping...",
});

async function init(): Promise<void> {
  await foreachAsync(
    [
      {
        message: "Loading resources...",
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
        message: "Filesystem setup...",
        async handler() {
          await fs.init();

          return true;
        },
      },
      {
        message: "Checking permissing storage...",
        async handler() {
          if (
            (await Filesystem.checkPermissions()).publicStorage !== "granted"
          ) {
            await Filesystem.requestPermissions();
          }

          return true;
        },
      },
    ],
    async (task, index, { length }) => {
      status.value = {
        progress: (index / length) * 100,
        message: task.message,
      };
      await task.handler();
    }
  );

  status.value = {
    progress: 100,
    message: "Setup done!",
  };

  emit("done");
}
void init();
</script>

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
