<template>
  <div class="fill-width fill-height">
    <div
      class="
        navigation--toolbar
        grey-2
        d-flex
        align-center
        justify-space-between
        fill-width
      "
    >
      <div class="d-flex align-center justify-space-between order-1">
        <v-btn icon @click="search = !search" :color="search ? `blue` : null">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon @click="reloadListFile(true)">
          <v-icon>mdi-reload</v-icon>
        </v-btn>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <v-list-item
              class="min-height-0"
              @click="
                adding = true;
                addingFolder = false;
              "
            >
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-file-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("New File") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              class="min-height-0"
              @click="
                adding = true;
                addingFolder = true;
              "
            >
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-folder-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("New Folder") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0" @click="importFile">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-download</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Import File") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-undo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Undo") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-redo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Redo") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="d-flex order-0 text-truncate">
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title text-truncate">{{ tree ? tree.name : "" }}</span>
      </div>
    </div>

    <div class="fill-height">
      <app-field v-show="search" class="mx-2" />

      <div class="fill-height overflow-y-scroll" v-if="tree">
        <app-file-add
          :state.sync="adding"
          :is-folder="addingFolder"
          :directory="tree.file"
          @created="reloadListFile"
          :list-files="tree.children"
        />

        <app-file-system
          :level="0"
          :files="tree.children"
          v-if="tree.children"
          @reload="reloadListFile"
          :list-files="tree.children"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AppFileSystem from "@/components/AppFileSystem";
import AppField from "@/components/AppField";
import AppFileAdd from "@/components/AppFileAdd";
import { readTreeFolder } from "@/modules/filesystem";
import importFiles from "@/modules/import-files";
import { Toast } from "@capacitor/toast";

export default {
  components: {
    AppFileSystem,
    AppField,
    AppFileAdd,
  },
  data() {
    return {
      search: false,

      adding: false,
      addingFolder: false,

      tree: null,
    };
  },
  watch: {
    "$store.state.editor.project": {
      async handler() {
        await this.reloadListFile();
      },
      immediate: true,
    },
  },
  methods: {
    async reloadListFile(notification = false) {
      this.tree = await readTreeFolder(
        `projects/${this.$store.state.editor.project}`
      );

      if (notification) {
        await Toast.show({
          text: this.$t("Reload project"),
        });
      }
    },
    async importFile() {
      const names = await importFiles(
        `projects/${this.$store.state.editor.project}`
      );
      await this.reloadListFile();
      await Toast.show({
        text: this.$t(`Imported file(s) {list}`, {
          list: names.map((item) => `"${item}"`).join(", "),
        }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
