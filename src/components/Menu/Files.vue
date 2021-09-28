<template>
  <Template-Tab>
    <template v-slot:title>{{ projectName }} </template>

    <template v-slot:addons>
      <q-btn
        icon="mdi-reload"
        @click="reloadListFile(true)"
        flat
        round
        padding="xs"
        size="13px"
      />
      <q-btn
        icon="mdi-plus"
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
      >
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
            <template v-if="clipboardExists">
              <q-item
                clickable
                v-close-popup
                v-ripple
                @click="paste"
                :disable="notAllowPaste"
                class="no-min-height"
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon name="ti-clipboard" />
                </q-item-section>
                <q-item-section>{{ $t("label.paste") }}</q-item-section>
              </q-item>
              <q-separator />
            </template>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="
                adding = true;
                addingFolder = false;
              "
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-file" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-file") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="
                adding = true;
                addingFolder = true;
              "
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-folder" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-folder") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="importFiles($store.state.editor.project as string)"
              class="no-min-height"
              v-if="$store.state.editor.project"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-import" />
              </q-item-section>
              <q-item-section>{{ $t("label.import-files") }}</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup v-ripple class="no-min-height">
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-undo" />
              </q-item-section>
              <q-item-section>{{ $t("label.undo") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple class="no-min-height">
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-redo" />
              </q-item-section>
              <q-item-section>{{ $t("label.redo") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents v-if="$store.state.editor.project">
      <div>
        <q-pull-to-refresh
          @refresh="(done: () => void) => void reloadListFile().then(() => void done())"
          icon="mdi-refresh"
        >
          <FileExplorer-Add
            v-model:adding="adding"
            :is-folder="addingFolder"
            :names-exists="files.map((item) => basename(item.fullpath))"
            :dirname="$store.state.editor.project"
            allow-open-editor
          />

          <FileExplorer-List :files-list="files" />
        </q-pull-to-refresh>
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import FileExplorerAdd from "components/File Explorer/Add.vue";
import FileExplorerList from "components/File Explorer/List.vue";
import { basename } from "path-cross";
import { Notify } from "quasar";
import {
  readdirAndStat,
  registerWatch,
  sortTreeFilesystem,
  StatItem,
} from "src/helpers/fs-helper";
import { useImportFiles } from "src/helpers/useImportFiles";
import fs from "src/modules/fs";
import { useStore } from "src/store";
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import TemplateTab from "./template/Tab.vue";

const store = useStore();
const i18n = useI18n();

const importFiles = useImportFiles();

const adding = ref<boolean>(false);
const addingFolder = ref<boolean>(false);
const files = reactive<StatItem[]>([]);
const projectName = computed<string | null>(() =>
  store.state.editor.project ? basename(store.state.editor.project) : null
);
const clipboardExists = computed<boolean>(
  () => store.getters["clipboard-fs/isEmpty"] === false
);
const notAllowPaste = computed<boolean>(
  () =>
    store.getters["clipboard-fs/allowPaste"](store.state.editor.project) ===
    false
);

watch(
  () => store.state.editor.project,
  async () => {
    // eslint-disable-next-line functional/immutable-data
    files.splice(0);
    await reloadListFile();
  },
  {
    immediate: true,
  }
);

async function reloadListFile(notification = false): Promise<void> {
  const task = Notify.create({
    group: false,
    spinner: true,
    type: "ongoing",
    timeout: 0,
    position: "bottom-right",
    message: i18n.t("alert.reload.file(s)"),
    caption: store.state.editor.project ?? void 0,
  });

  try {
    if (!store.state.editor.project) {
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("IS_NOT_DIR");
    }

    // eslint-disable-next-line functional/immutable-data
    files.splice(0);
    // eslint-disable-next-line functional/immutable-data
    files.push(...(await readdirAndStat(store.state.editor.project)));

    task();

    if (notification) {
      void Toast.show({
        text: i18n.t("alert.reload.file(s)"),
      });
    }
  } catch {
    // eslint-disable-next-line functional/immutable-data
    files.splice(0);
    task({
      message: i18n.t("alert.failure.reload.file(s)"),
      caption: store.state.editor.project ?? void 0,
      type: "negative",
      timeout: 1000,
      spinner: false,
    });
  }
}

async function paste() {
  await store.dispatch("clipboard-fs/paste", store.state.editor.project);
}

registerWatch(
  "projects/*/*",
  async ({ path }) => {
    // fork
    // if not exists
    if (
      basename(path) !== ".git" &&
      files.some(({ fullpath }) => fs.isEqual(fullpath, path)) === false
    ) {
      try {
        const stat = await fs.stat(path);
        // eslint-disable-next-line functional/immutable-data
        files.push(
          ...sortTreeFilesystem([
            // eslint-disable-next-line functional/immutable-data
            ...files.splice(0),
            {
              stat,
              fullpath: path,
            },
          ])
        );
      } catch {}
    }
  },
  {
    exists: true,
    dir: () => store.state.editor.project,
  }
);
registerWatch(
  "projects/*/*",
  ({ path }) => {
    if (
      basename(path) !== ".git" &&
      files.some(({ fullpath }) => fs.isEqual(fullpath, path))
    ) {
      // eslint-disable-next-line functional/immutable-data
      files.push(
        // eslint-disable-next-line functional/immutable-data
        ...files
          .splice(0)
          .filter(({ fullpath }) => fs.isEqual(fullpath, path) === false)
      );
    }
  },
  {
    exists: false,
    dir: () => store.state.editor.project,
  }
);
</script>
