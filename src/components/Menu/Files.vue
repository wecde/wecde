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
        <span class="app-title text-truncate">{{ projectName }}</span>
      </div>
    </div>

    <div class="fill-height">
      <v-text-field
        placeholder="Search"
        outline
        rounded
        class="py-1 grey-4 mx-2"
        hide-details
        close-on-click
        append-icon="mdi-close"
        v-if="search"
      />
      <div class="fill-height overflow-y-scroll" v-if="tree">
        <file-explorer-add
          :adding.sync="adding"
          :is-folder="addingFolder"
          dirname="projects"
          @created="reloadListFile"
          :names-exists="tree.map((item) => item.name)"
        />

        <file-explorer-list
          :files-list="tree"
          @removed-file="tree.splice($event, 1)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";

import FileExplorerList from "@/components/File Explorer/List.vue";
import FileExplorerAdd from "@/components/File Explorer/Add.vue";
import { stat, ReaddirStatItem, readdirStat } from "@/modules/filesystem";
import importFiles from "@/modules/import-files";
import { Toast } from "@capacitor/toast";
import { basename } from "path";
import store from "@/store";

export default defineComponent({
  components: {
    FileExplorerList,
    FileExplorerAdd,
  },
  setup() {
    const search = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const tree = ref<ReaddirStatItem[]>([]);
    const projectName = computed<string | null>(() =>
      store.state.editor.project ? basename(store.state.editor.project) : null
    );

    return {
      search,
      adding,
      addingFolder,
      tree,
      projectName,
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
    async reloadListFile(notification = false): Promise<void> {
      try {
        if (
          (await stat(this.$store.state.editor.project)).type !== "directory"
        ) {
          throw new Error(`IS_NOT_DIR`);
        }

        this.tree = await readdirStat(
          this.$store.state.editor.project,
          void 0,
          [".git"]
        );

        if (notification) {
          await Toast.show({
            text: this.$t("Reload project") as string,
          });
        }
      } catch (err) {
        console.log(err);
        this.tree = [];
      }
    },
    async importFile(): Promise<void> {
      const names = await importFiles(this.$store.state.editor.project);
      await this.reloadListFile();
      await Toast.show({
        text: this.$t(`Imported file(s) {list}`, {
          list: names.map((item) => `"${item}"`).join(", "),
        }) as string,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
