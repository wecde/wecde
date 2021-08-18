<template>
  <q-drawer
    v-model="navigation"
    :width="300"
    class="flex column never-scroll no-wrap"
  >
    <q-tabs v-model="navigationTabs" class="tabs">
      <q-tab name="archive" :icon="mdiArchiveOutline" />
      <q-tab name="files" :icon="mdiFileMultipleOutline" />
      <q-tab
        name="git"
        :icon="mdiGit"
        alert
        :alert-icon="
          $store.state['git-project'].isLoading ? mdiClockOutline : null
        "
      />
      <q-tab name="search" :icon="mdiMagnify" />
      <q-tab name="settings" :icon="mdiCogOutline" />
    </q-tabs>

    <q-tab-panels
      v-model="navigationTabs"
      animated
      keep-alive
      class="bg-transparent panels"
    >
      <q-tab-panel name="archive" class="q-pa-0 q-pt-1 flex no-wrap column">
        <Menu-Archive @open:project="navigationTabs = 1" />
      </q-tab-panel>
      <q-tab-panel name="files" class="q-pa-0 q-pt-1 flex no-wrap column">
        <Menu-Files />
      </q-tab-panel>
      <q-tab-panel name="git" class="q-pa-0 q-pt-1 flex no-wrap column">
        <Menu-Git />
      </q-tab-panel>
      <q-tab-panel name="search" class="q-pa-0 q-pt-1 flex no-wrap column">
        <Menu-Search />
      </q-tab-panel>
      <q-tab-panel name="settings" class="q-pa-0 q-pt-1 flex no-wrap column">
        <Menu-Settings />
      </q-tab-panel>
    </q-tab-panels>
  </q-drawer>
</template>

<script lang="ts">
import {
  mdiArchiveOutline,
  mdiClockOutline,
  mdiCogOutline,
  mdiFileMultipleOutline,
  mdiGit,
  mdiMagnify,
} from "@quasar/extras/mdi-v5";
import MenuArchive from "components/Menu/Archive.vue";
import MenuFiles from "components/Menu/Files.vue";
import MenuGit from "components/Menu/Git.vue";
import MenuSearch from "components/Menu/Search.vue";
import MenuSettings from "components/Menu/Settings.vue";
import { useStore } from "src/store";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    MenuArchive,
    MenuFiles,
    MenuGit,
    MenuSearch,
    MenuSettings,
  },
  setup() {
    const store = useStore();

    return {
      mdiArchiveOutline,
      mdiFileMultipleOutline,
      mdiGit,
      mdiClockOutline,
      mdiMagnify,
      mdiCogOutline,

      navigationTabs: ref<string>("archive"),
      navigation: computed<boolean>({
        get() {
          return store.state.system.navigation;
        },
        set(value): void {
          store.commit("system/setNavigation", value);
        },
      }),
    };
  },
});
</script>

<style lang="scss" scoped>
.tabs {
  :deep(.q-tabs__arrow) {
    display: none;
  }
  :deep(.q-tab) {
    padding: {
      left: 0;
      right: 0;
    }
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
}
.panels {
  :deep(.q-panel) {
    overflow: visible;
  }
}
</style>
