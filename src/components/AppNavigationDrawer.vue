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

      <v-tabs-items
        v-model="navigationTabs"
        style="height: 100%; overflow: hidden scroll"
        class="fill-width"
      >
        <v-tab-item>
          <app-menu-archive />
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
  }
}
</style>
