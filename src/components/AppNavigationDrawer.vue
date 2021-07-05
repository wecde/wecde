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
          <app-menu-archive @toFiles="navigationTabs = 1" />
        </v-tab-item>
        <v-tab-item>
          <app-menu-files />
        </v-tab-item>
        <v-tab-item>
          <app-menu-search />
        </v-tab-item>
        <v-tab-item>
          <app-menu-settings />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-navigation-drawer>
</template>

<script>
import AppMenuArchive from "@/components/Menu/Archive";
import AppMenuFiles from "@/components/Menu/Files";
import AppMenuSearch from "@/components/Menu/Search";
import AppMenuSettings from "@/components/Menu/Settings";
import { stat } from "@/modules/filesystem";

export default {
  components: {
    AppMenuArchive,
    AppMenuFiles,
    AppMenuSearch,
    AppMenuSettings,
  },
  data() {
    return {
      navigationTabs: null,
    };
  },

  watch: {
    "$store.state.editor.project": {
      async handler(newValue) {
        try {
          if ((await stat(`projects/${newValue}`)).type !== "directory") {
            throw new Error(`IS_NOT_DIR`);
          }

          this.navigationTabs = 1;
        } catch {
          this.$store.commit("editor/setProject", null);
        }
      },
    },
  },

  computed: {
    navigation: {
      get() {
        return this.$store.state.system.navigation;
      },
      set(value) {
        this.$store.commit("system/setNavigation", value);
      },
    },
  },

  beforeMount() {
    if (this.$store.state.editor.session) {
      this.navigationTabs = 1;
    }
  },
};
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
