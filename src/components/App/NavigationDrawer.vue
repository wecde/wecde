<template>
  <v-navigation-drawer
    app
    fixed
    v-model="navigation"
    width="300px"
    color="grey-1"
    class="navigation"
  >
    <div
      class="d-flex flex-column align-center justify-space-between fill-height"
    >
      <v-tabs
        color="primary"
        slider-color="primary"
        fixed-tabs
        centered
        class="d-flex tabs--navigation"
        background-color="transparent"
        v-model="navigationTabs"
      >
        <v-tab>
          <v-icon>{{ mdiArchiveOutline }}</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>{{ mdiFileMultipleOutline }}</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>{{ mdiGit }}</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>{{ mdiMagnify }}</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>{{ mdiCogOutline }}</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items
        v-model="navigationTabs"
        touchless
        class="fill-width fill-height"
      >
        <v-tab-item>
          <Menu-Archive @toFiles="navigationTabs = 1" />
        </v-tab-item>
        <v-tab-item>
          <Menu-Files />
        </v-tab-item>
        <v-tab-item>
          <Menu-Git />
        </v-tab-item>
        <v-tab-item>
          <Menu-Search />
        </v-tab-item>
        <v-tab-item>
          <Menu-Settings />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";
import MenuArchive from "@/components/Menu/Archive.vue";
import MenuFiles from "@/components/Menu/Files.vue";
import MenuGit from "@/components/Menu/Git.vue";
import MenuSearch from "@/components/Menu/Search.vue";
import MenuSettings from "@/components/Menu/Settings.vue";
import store from "@/store";
import {
  mdiArchiveOutline,
  mdiFileMultipleOutline,
  mdiGit,
  mdiMagnify,
  mdiCogOutline,
} from "@mdi/js";

export default defineComponent({
  components: {
    MenuArchive,
    MenuFiles,
    MenuGit,
    MenuSearch,
    MenuSettings,
  },
  setup() {
    return {
      mdiArchiveOutline,
      mdiFileMultipleOutline,
      mdiGit,
      mdiMagnify,
      mdiCogOutline,

      navigationTabs: ref<number | null>(null),
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

  created() {
    if (this.$store.state.editor.project) {
      this.navigationTabs = 1;
    }
  },
});
</script>

<style lang="scss" scoped>
.tabs {
  &::v-deep .v-tab--active {
    background-color: #424242;
    border-radius: 0.5em 0.5em 0 0;
  }
}

.navigation {
  &,
  &::v-deep * {
    ::-webkit-scrollbar {
      display: none;
    }
    // scrollbar-width: none;

    .v-window-item {
      height: 100%;
    }
  }
}
</style>

<style lang="scss" scoped>
.tabs--navigation {
  width: 100%;

  &::v-deep {
    .v-item-group {
      width: 100%;
    }

    .v-slide-group__prev,
    .v-slide-group__next {
      display: none !important;
    }

    .v-slide-group__wrapper {
      position: relative;
      .v-slide-group__content {
        width: 100%;
        position: relative;
        .v-tab {
          min-width: 0px;
        }
      }
    }
  }
}
</style>
