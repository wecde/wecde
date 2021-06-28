<template>
  <div class="fill-width">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title">{{ tree ? tree.file : "" }}</span>
      </div>

      <div>
        <v-btn icon @click="search = !search" :color="search ? `blue` : null">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-reload</v-icon>
        </v-btn>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-file-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> New File </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-folder-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> New Folder </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-download</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Import File </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-undo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Undo </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-redo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Redo </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <div>
      <app-field v-show="search" class="mx-2" />

      <app-file-system :level="0" :files="tree.children" />
    </div>
  </div>
</template>

<script>
import AppFileSystem from "@/components/AppFileSystem";
import AppField from "@/components/AppField";
import { readTreeFolder } from "@/modules/filesystem";

export default {
  components: {
    AppFileSystem,
    AppField,
  },
  data() {
    return {
      search: false,

      tree: {},
    };
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
