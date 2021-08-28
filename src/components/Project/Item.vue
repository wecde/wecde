<template>
  <q-item
    clickable
    v-ripple
    @click="$store.commit(`editor/setProject`, project.fullpath)"
  >
    <q-item-section avatar>
      <q-img
        :src="
          require(`assets/extensions/material-icon-theme/icons/${
            $store.state.editor.project &&
            isEqual(project.fullpath, $store.state.editor.project)
              ? 'folder-project-open.svg'
              : 'folder-project.svg'
          }`)
        "
        :size="40"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>
        <FileExplorer-Rename
          v-model:renaming="renaming"
          :is-folder="true"
          :names-exists="namesExists"
          dirname="projects"
          v-model:fullpath="project.fullpath"
          no-icon
          allow-update-store
          :allow-rename="true"
        />
      </q-item-label>
      <q-item-label caption>
        {{ $t("label.modified") }}
        <vue-timeagojs :time="new Date(project.stat.mtime)" :delay="30000" />
      </q-item-label>
    </q-item-section>

    <q-item-section side top>
      <q-btn icon="mdi-dots-vertical" flat round padding="xs" @click.stop>
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list>
            <q-item clickable v-close-popup v-ripple @click="exportZip">
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-archive-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.export-zip") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup v-ripple @click="renaming = true">
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-pen" />
              </q-item-section>
              <q-item-section>{{ $t("label.rename") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="$emit(`click:delete`)"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-delete-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.delete") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import exportZip from "modules/export-zip";
import fs from "modules/fs";
import { basename } from "path-cross";
import type { StatItem } from "src/helpers/fs";
import { defineComponent, PropType, ref } from "vue";

import FileExplorerRename from "../File Explorer/Rename.vue";

export default defineComponent({
  emits: ["click:delete"],
  components: {
    FileExplorerRename,
  },
  props: {
    project: {
      type: Object as PropType<StatItem>,
      required: true,
    },
    namesExists: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup() {
    return {
      renaming: ref<boolean>(false),
    };
  },
  methods: {
    isEqual(path1: string, path2: string): boolean {
      return fs.isEqual(path1, path2);
    },
    async exportZip() {
      try {
        await exportZip(this.project.fullpath);
        this.$store.commit("terminal/clear");

        void Toast.show({
          text: this.$t("alert.exported.project", {
            name: basename(this.project.fullpath),
          }),
        });
      } catch (err) {
        this.$store.commit("terminal/error", err);
      }
    },
  },
});
</script>
