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
          <v-icon>mdi-archive-outline</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>mdi-file-multiple-outline</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>mdi-magnify</v-icon>
        </v-tab>
        <v-tab>
          <v-icon>mdi-cog-outline</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="navigationTabs" class="fill-width fill-height">
        <v-tab-item>
          <Menu-Archive @toFiles="navigationTabs = 1" />
        </v-tab-item>
        <v-tab-item>
          <Menu-Files />
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
import MenuSearch from "@/components/Menu/Search.vue";
import MenuSettings from "@/components/Menu/Settings.vue";
import { stat } from "@/modules/filesystem";
import store from "@/store";

export default defineComponent({
  components: {
    MenuArchive,
    MenuFiles,
    MenuSearch,
    MenuSettings,
  },
  setup() {
    return {
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

  watch: {
    "$store.state.editor.project": {
      async handler(newValue) {
        try {
          if ((await stat(newValue)).type !== "directory") {
            throw new Error(`IS_NOT_DIR`);
          }

          this.navigationTabs = 1;
        } catch {
          this.$store.commit("editor/setProject", null);
        }
      },
      immediate: true,
    },
  },

  created() {
    if (this.$store.state.editor.session) {
      this.navigationTabs = 1;
    }
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/tabs-navigator.scss";

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
