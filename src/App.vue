<template>
  <v-app>
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
    <Terminal />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from "@vue/composition-api";
import AppNavigationDrawer from "@/components/App/NavigationDrawer.vue";
import Terminal from "@/components/Terminal/Index.vue";
import { requestPermissions } from "@/modules/filesystem";
import { loadLanguageAsync } from "@/i18n";
import store from "@/store";

export default defineComponent({
  components: {
    AppNavigationDrawer,
    Terminal,
  },
  setup() {
    onMounted(async () => {
      await requestPermissions();
    });

    return {
      progress: computed<boolean>(() => store.state.progress.isShow),
    };
  },
  watch: {
    "$store.state.settings.appearance.language": {
      async handler(newValue: string) {
        // console.log(newValue);
        await loadLanguageAsync(newValue);
      },
      immediate: true,
    },
  },
});
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(231, 231, 231, 0.1);
  transition: background-color 0.33s cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(231, 231, 231, 0.3);
}
// * {
//   // scrollbar-width: none;
// }
</style>
