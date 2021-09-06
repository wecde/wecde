<template>
  <q-item
    clickable
    v-ripple
    @click="$store.commit(`editor/set:project`, project.fullpath)"
    class="no-min-height"
  >
    <q-item-section avatar>
      <q-img
        :src="
          git
            ? require(`assets/extensions/material-icon-theme/icons/folder-git.svg`)
            : require(`assets/extensions/material-icon-theme/icons/folder.svg`)
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
          :class="{
            'text-blue': opened,
          }"
        >
          <template v-slot:append-text v-if="git">
            <small>GIT</small>
          </template>
        </FileExplorer-Rename>
      </q-item-label>
      <q-item-label
        caption
        :class="{
          'text-blue': opened,
        }"
      >
        {{ $t("label.modified") }}
        <vue-timeagojs :time="new Date(project.stat.mtimeMs)" :delay="30000" />
      </q-item-label>
    </q-item-section>

    <q-item-section side top class="no-min-height">
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
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="exportDirectoryByZip"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-archive-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.export-zip") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="renaming = true"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-pencil" />
              </q-item-section>
              <q-item-section>{{ $t("label.rename") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="$emit(`click:delete`)"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-trash" />
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
import fs from "modules/fs";
import { basename } from "path-cross";
import exportDirectoryByZip from "src/helpers/exportDirectoryByZip";
import type { StatItem } from "src/helpers/fs";
import { useStore } from "src/store";
import { computed, defineComponent, PropType, ref } from "vue";

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
    git: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    return {
      renaming: ref<boolean>(false),
      opened: computed<boolean>(() => {
        return (
          !!store.state.editor.project &&
          fs.isEqual(store.state.editor.project, props.project.fullpath)
        );
      }),
    };
  },
  methods: {
    async exportDirectoryByZip() {
      try {
        await exportDirectoryByZip(this.project.fullpath);
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
