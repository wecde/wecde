<template>
  <q-drawer
    v-model="navigation"
    :width="300"
    class="flex column never-scroll no-wrap"
  >
    <q-tabs v-model="navigationTabs" class="tabs">
      <q-tab
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :alert="'alert-icon' in tab && tab['alert-icon'].value ? 'blue' : false"
        :alert-icon="'alert-icon' in tab ? tab['alert-icon'].value : undefined"
      />
    </q-tabs>

    <q-tab-panels
      v-model="navigationTabs"
      animated
      keep-alive
      class="bg-transparent panels"
    >
      <q-tab-panel
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        class="q-pa-0 q-pt-1 flex no-wrap column"
      >
        <component :is="tab.panel" />
      </q-tab-panel>
    </q-tab-panels>
  </q-drawer>
</template>

<script lang="ts">
import MenuArchive from "components/Menu/Archive.vue";
import MenuFiles from "components/Menu/Files.vue";
import MenuGit from "components/Menu/Git.vue";
import MenuSearch from "components/Menu/Search.vue";
import MenuSettings from "components/Menu/Settings.vue";
import { useStore } from "src/store";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const tabs = [
      {
        name: "archive",
        icon: "mdi-archive-outline",
        panel: MenuArchive,
      },
      {
        name: "files",
        icon: "mdi-file-multiple-outline",
        panel: MenuFiles,
      },
      {
        name: "git",
        icon: "mdi-git",
        "alert-icon": computed<string | null>(() =>
          store.state.editor.git.statusMatrix.loading ? "mdi-clock-outline" : null
        ),
        panel: MenuGit,
      },
      {
        name: "search",
        icon: "mdi-magnify",
        panel: MenuSearch,
      },
      {
        name: "settings",
        icon: "mdi-cog-outline",
        panel: MenuSettings,
      },
    ];

    return {
      tabs,

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
