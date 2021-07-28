<template>
  <v-app>
    <template v-if="ready">
      <v-progress-linear
        indeterminate
        color="cyan"
        fixed
        top
        rounded
        height="3px"
        style="z-index: 1000"
        v-if="progress"
      />
      <App-NavigationDrawer />
      <v-main>
        <Terminal />
        <router-view />
      </v-main>
    </template>
    <template v-else>
      <div
        class="
          fill-width fill-height
          d-flex
          flex-column
          justify-center
          align-center
          text-center
        "
      >
        <div>
          <img
            width="160px"
            height="160px"
            :src="require(`@/assets/favicon.svg`)"
          />
        </div>
        <div>
          <h1 class="app--name">Shin Code Editor</h1>

          <div
            class="progress mt-3"
            v-if="status"
            style="height: calc(1.5em + 4px)"
          >
            <v-progress-linear rounded color="cyan" :value="status.value" />
            <span class="progress-status-text text-caption">{{
              status.status
            }}</span>
          </div>
        </div>
      </div>
    </template>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import AppNavigationDrawer from "@/components/App/NavigationDrawer.vue";
import Terminal from "@/components/Terminal.vue";
import i18n, { loadLanguageAsync } from "@/i18n";
import store from "@/store";
import { stat } from "@/modules/filesystem";
import { Filesystem } from "@capacitor/filesystem";

const progress: {
  message: string;
  handler: {
    (): Promise<true | string>;
  };
}[] = [
  {
    message: i18n.t("Loading resources") as string,
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
    message: i18n.t("Checking last session") as string,
    async handler() {
      if (store.state.editor.project) {
        try {
          if ((await stat(store.state.editor.project)).type !== "directory") {
            throw new Error(`Last session removed`);
          }
        } catch (err) {
          return "Last session removed";
        }
      }

      return true;
    },
  },
  {
    message: i18n.t("Checking permissing storage") as string,
    async handler() {
      if ((await Filesystem.checkPermissions()).publicStorage !== "granted") {
        await Filesystem.requestPermissions();
      }

      return true;
    },
  },
];

export default defineComponent({
  components: {
    AppNavigationDrawer,
    Terminal,
  },
  setup() {
    const ready = ref<boolean>(false);
    const status = ref<{
      value: number;
      status: string;
    } | null>(null);

    async function init() {
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
    init();

    return {
      ready,
      progress: computed<boolean>(() => store.state.system.progress),
      status,
    };
  },
  watch: {
    "$store.state.settings.appearance__language": {
      async handler(newValue: string) {
        // console.log(newValue);
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!newValue) {
          await loadLanguageAsync(newValue);
        } else {
          this.$store.commit("settings/setState", {
            prop: "appearance/language",
            value: navigator.language.split("-").slice(0, -1).join("-"),
          });
        }
      },
      immediate: true,
    },
  },
});
</script>

<style lang="scss">
@import "~@/assets/fonts/Roboto/fonts.css";

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

.min-height-0 {
  min-height: 0;
}

.fill-width {
  width: 100%;
}

.fill-height {
  height: 100%;
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
  src: url(~@/assets/fonts/Orbitron.woff2) format("woff2");
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
