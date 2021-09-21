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
              @click="exportZipThis"
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
              @click="remove"
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

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import fs from "modules/fs";
import { basename, join } from "path-cross";
import { Notify, useQuasar } from "quasar";
import { registerWatch, StatItem } from "src/helpers/fs-helper";
import { useExportZip } from "src/helpers/useExportZip";
import { useStore } from "src/store";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import FileExplorerRename from "../File Explorer/Rename.vue";

const props = defineProps<{
  project: StatItem;
  namesExists: string[];
}>();

const store = useStore();
const $q = useQuasar();
const i18n = useI18n();

const exportZip = useExportZip();

const renaming = ref<boolean>(false);
const git = ref<boolean>(false);
const opened = computed<boolean>(() => {
  return (
    !!store.state.editor.project &&
    fs.isEqual(store.state.editor.project, props.project.fullpath)
  );
});

registerWatch(
  () => join(props.project.fullpath, ".git/HEAD"),
  async ({ path }) => {
    git.value = await fs.isFile(path);
  },
  {
    type: "file",
    mode: "absolute",
    immediate: true,
  }
);

async function exportZipThis() {
  try {
    await exportZip(props.project.fullpath);
    store.commit("terminal/clear");

    void Toast.show({
      text: i18n.t("alert.exported.project", {
        name: basename(props.project.fullpath),
      }),
    });
  } catch (err) {
    store.commit("terminal/error", err);
  }
}
function remove() {
  $q.dialog({
    title: "Confirm",
    message: `Are you sure want to delete "${basename(
      props.project.fullpath
    )}"`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const task = Notify.create({
      group: false,
      spinner: true,
      type: "ongoing",
      timeout: 0,
      position: "bottom-right",
      message: i18n.t("alert.removing.project", {
        name: basename(props.project.fullpath),
      }),
    });

    try {
      await fs.rmdir(props.project.fullpath, {
        recursive: true,
      });
      task();
      void Toast.show({
        text: i18n.t("alert.removed.project", {
          name: basename(props.project.fullpath),
        }),
      });
    } catch {
      task({
        message: i18n.t("alert.failure.remove.project", {
          name: basename(props.project.fullpath),
        }),
        type: "negative",
        timeout: 1000,
        spinner: false,
      });
      void Toast.show({
        text: i18n.t("alert.failure.remove.project", {
          name: basename(props.project.fullpath),
        }),
      });
    }
  });
}
</script>
