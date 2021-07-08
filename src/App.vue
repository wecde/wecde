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
      v-if="$store.state.progress.isShow"
    />
    <app-navigation-drawer />
    <app-terminal />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import AppNavigationDrawer from "@/components/AppNavigationDrawer";
import AppTerminal from "@/components/AppTerminal";
import { requestPermissions } from "@/modules/filesystem";
import {
  defineComponent,
  onMounted,
} from "@vue/composition-api";
import { loadLanguageAsync } from "@/plugins/i18n";

export default defineComponent({
  components: {
    AppNavigationDrawer,
    AppTerminal,
  },
  setup() {
    onMounted(async () => {
      await requestPermissions();
    });

    return {};
  },
  watch: {
    "$store.state.settings.appearance.language": {
      async handler(newValue) {
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
