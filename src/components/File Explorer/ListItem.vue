<template>
  <div
    class="file-object"
    :class="{
      dark: $q.dark.isActive,

      'star-added': status === `020` || status === `022` || status === '02x',
      added: status === `023`,

      ignored: ignored,
      'is-folder': file.stat.isDirectory(),

      'star-modified': status === `121` || status === '12x',
      modified: status === `122` || status === `123`,

      'star-deleted':
        file.stat.isFile() && (status === `101` || status === '10x'),
      deleted: file.stat.isFile() && status === `100`,
    }"
    v-ripple
    @click="clickToFile"
  >
    <FileExplorer-Rename
      :is-folder="file.stat.isDirectory()"
      v-model:renaming="renaming"
      :names-exists="namesExists"
      v-model:fullpath="file.fullpath"
      allow-rename
      allow-update-store
      class="mr-2"
    >
      <template v-slot:prepend>
        <q-icon
          size="20px"
          :name="collapse ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          v-if="file.stat.isDirectory()"
        />
      </template>

      <template v-slot:append-text>
        <q-spinner-hourglass color="green" v-if="loading" />
        <q-icon size="13px" color="info" name="ti-pencil-alt" v-if="opening" />
        <q-icon
          size="13px"
          color="warning"
          name="ti-cut"
          v-if="
            store.getters['clipboard-fs/cutting'] &&
            store.getters['clipboard-fs/has'](props.file.fullpath)
          "
        />
      </template>
    </FileExplorer-Rename>

    <div class="actions">
      <q-btn color="inherit" flat dense icon="mdi-dots-vertical" @click.stop>
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
            <template
              v-if="
                store.getters['clipboard-fs/isEmpty'] === false &&
                fs.isEqual(
                  store.state['clipboard-fs'].clipboardFile,
                  file.fullpath
                ) === false
              "
            >
              <q-item
                clickable
                v-close-popup
                v-ripple
                @click="paste"
                :disable="
                  store.getters['clipboard-fs/allowPaste'](
                    props.file.fullpath
                  ) === false
                "
                class="no-min-height"
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon name="ti-clipboard" />
                </q-item-section>
                <q-item-section>{{ $t("label.paste") }}</q-item-section>
              </q-item>
              <q-separator />
            </template>

            <template v-if="file.stat.isDirectory()">
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

              <Action-Import-Files :dirname="file.fullpath">
                <template v-slot:default="{ on }">
                  <q-item
                    clickable
                    v-close-popup
                    v-ripple
                    @click="on"
                    class="no-min-height"
                  >
                    <q-item-section avatar class="min-width-0">
                      <q-icon name="ti-import" />
                    </q-item-section>
                    <q-item-section>{{
                      $t("label.import-files")
                    }}</q-item-section>
                  </q-item>
                </template>
              </Action-Import-Files>

              <q-separator />
            </template>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="cut"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-cut" />
              </q-item-section>
              <q-item-section>{{ $t("label.cut") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="copy"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-files" />
              </q-item-section>
              <q-item-section>{{ $t("label.copy") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              v-close-popup
              @click.stop.prevent="renaming = true"
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

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="exportFile"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="ti-share" />
              </q-item-section>
              <q-item-section>{{
                $t(
                  file.stat.isDirectory()
                    ? "label.export-folder"
                    : "label.export-file"
                )
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
  <div class="q-ml-3" v-if="file.stat.isDirectory()" v-show="collapse">
    <FileExplorer-Add
      v-model:adding="adding"
      :is-folder="addingFolder"
      :names-exists="files.map((file) => basename(file.fullpath))"
      :dirname="file.fullpath"
      class="flex items-center order-0"
      allow-open-editor
    />
    <FileExplorer-List :files-list="files" />
  </div>
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import ActionImportFiles from "components/Action-ImportFiles.vue";
import { saveAs } from "file-saver";
import { isIgnored } from "isomorphic-git";
import { btoa } from "js-base64";
import fs from "modules/fs";
import { basename, dirname } from "path-cross";
import { Notify, useQuasar } from "quasar";
import { useExportZip } from "src/helpers/useExportZip";
import {
  readdirAndStat,
  registerWatch,
  sortTreeFilesystem,
  StatItem,
} from "src/helpers/fs-helper";
import { useFullpathFromRoute } from "src/helpers/useFullpathFromRoute";
import { useStore } from "src/store";
import { computed, defineAsyncComponent, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import FileExplorerAdd from "./Add.vue";
import FileExplorerRename from "./Rename.vue";

const FileExplorerList = defineAsyncComponent({
  loader: () => import("./List.vue") as never,
});

const props = defineProps<{
  file: StatItem;
  namesExists: readonly string[];
}>();

const store = useStore();
const $q = useQuasar();
const i18n = useI18n();
const router = useRouter();

const exportZip = useExportZip();

const collapse = ref<boolean>(false);
const adding = ref<boolean>(false);
const loading = ref<boolean>(false);
const ignored = ref<boolean>(false);

registerWatch(
  "projects/*/.gitignore",
  async () => {
    if (store.state.editor.project) {
      ignored.value = await isIgnored({
        fs,
        dir: store.state.editor.project,
        filepath: fs.relative(store.state.editor.project, props.file.fullpath),
      });
    }
  },
  {
    immediate: true,
    dir: () => store.state.editor.project,
  }
);

watch(adding, (newValue) => {
  if (newValue) {
    if (props.file.stat.isDirectory()) {
      collapse.value = true;
    }
  }
});

const files = reactive<StatItem[]>([]);
const fullpathFromRoute = useFullpathFromRoute();
const opening = computed<boolean>(() => {
  if (
    (props.file.stat.isDirectory() ? collapse.value === false : true) &&
    fullpathFromRoute.value
  ) {
    if (props.file.stat.isDirectory()) {
      return fs.isParentDir(props.file.fullpath, fullpathFromRoute.value);
    }

    return fs.isEqual(fullpathFromRoute.value, props.file.fullpath);
  }

  return false;
});

// eslint-disable-next-line functional/no-let
let refresingFolder = false;
async function refreshFolder() {
  if (refresingFolder === false && props.file.stat.isDirectory()) {
    loading.value = true;
    refresingFolder = true;
    // eslint-disable-next-line functional/immutable-data
    files.splice(0);
    // eslint-disable-next-line functional/immutable-data
    files.push(...(await readdirAndStat(props.file.fullpath)));
    loading.value = false;
    refresingFolder = false;
  }
}

const watchFirstOpenCollapse = watch(collapse, (newValue) => {
  if (newValue) {
    void refreshFolder();
    watchFirstOpenCollapse();
  }
});

const renaming = ref<boolean>(false);
const addingFolder = ref<boolean>(false);
const status = computed<string | null>(() => {
  return store.getters["editor/status:filepath"](
    props.file.fullpath,
    props.file.stat.isDirectory()
  );
});

function remove() {
  $q.dialog({
    title: "Confirm",
    message: `Are you sure want to delete "${basename(props.file.fullpath)}"`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    if (props.file.stat.isDirectory()) {
      const task = Notify.create({
        spinner: true,
        timeout: 9999999999,
        position: "bottom-right",
        message: i18n.t("alert.removing.dir", {
          name: props.file.fullpath,
        }),
      });

      try {
        await fs.rmdir(props.file.fullpath, {
          recursive: true,
        });

        void Toast.show({
          text: i18n.t("alert.removed.dir", {
            name: props.file.fullpath,
          }),
        });

        task();
      } catch {
        void Toast.show({
          text: i18n.t("alert.failure.remove.dir", {
            name: props.file.fullpath,
          }),
        });

        task({
          message: i18n.t("alert.failure.remove.file", {
            name: props.file.fullpath,
          }),
        });
      }
    } else {
      const task = Notify.create({
        spinner: true,
        timeout: 9999999999,
        position: "bottom-right",
        message: i18n.t("alert.removing.file", {
          name: props.file.fullpath,
        }),
      });

      try {
        await fs.unlink(props.file.fullpath);

        void Toast.show({
          text: i18n.t("alert.removed.file", {
            name: props.file.fullpath,
          }),
        });

        task();
      } catch {
        void Toast.show({
          text: i18n.t("alert.failure.remove.dir", {
            name: props.file.fullpath,
          }),
        });

        task({
          message: i18n.t("alert.failure.remove.file", {
            name: props.file.fullpath,
          }),
        });
      }
    }
  });
}
function cut() {
  store.commit("clipboard-fs/cut", props.file.fullpath);
}
function copy() {
  store.commit("clipboard-fs/copy", props.file.fullpath);
}
async function paste() {
  if (
    await store.dispatch("clipboard-fs/paste", props.file.fullpath) // if required required refresh this parent
  ) {
  } else {
    if (props.file.stat.isDirectory()) {
      collapse.value = true;
    }
  }
}
async function exportFile() {
  if (props.file.stat.isDirectory()) {
    try {
      await exportZip(props.file.fullpath);
      store.commit("terminal/clear");
      void Toast.show({
        text: i18n.t("alert.exported.dir", {
          name: props.file.fullpath,
        }),
      });
    } catch (err) {
      store.commit("terminal/error", err);
    }
  } else {
    const task = Notify.create({
      timeout: 9999999999,
      spinner: true,
      position: "bottom-right",
      message: i18n.t("alert.exported.file", {
        name: props.file.fullpath,
      }),
    });

    const data = await fs.readFile(props.file.fullpath, "buffer");

    saveAs(new Blob([data]), basename(props.file.fullpath));
    task();

    void Toast.show({
      text: i18n.t("alert.exported.file", {
        name: props.file.fullpath,
      }),
    });
  }
}

function clickToFile() {
  if (props.file.stat.isDirectory() === false) {
    void router.push({
      name: "editor",
      query: {
        data: btoa(
          JSON.stringify({
            fullpath: props.file.fullpath,
          })
        ),
      },
    });
  } else {
    collapse.value = !collapse.value;
  }
}

registerWatch(
  () => props.file.fullpath,
  async ({ path }) => {
    // fork
    // if not e
    if (
      (fs.isEqual(path, props.file.fullpath) ||
        fs.isEqual(dirname(path), props.file.fullpath)) &&
      files.some(({ fullpath }) => fs.isEqual(fullpath, path)) === false
    ) {
      try {
        const stat = await fs.stat(path);

        if (
          files.some(({ fullpath }) => fs.isEqual(fullpath, path)) === false
        ) {
          // eslint-disable-next-line functional/immutable-data
          const oldFiles = files.splice(0);
          // eslint-disable-next-line functional/immutable-data
          files.push(
            ...sortTreeFilesystem([
              ...oldFiles,
              {
                stat,
                fullpath: path,
              },
            ])
          );
        }
      } catch {}
    }
  },
  {
    exists: true,
    mode: "abstract",
    dir: () => store.state.editor.project,
  }
);
registerWatch(
  () => props.file.fullpath,
  ({ path }) => {
    if (
      (fs.isEqual(path, props.file.fullpath) ||
        fs.isEqual(dirname(path), props.file.fullpath)) &&
      files.some(({ fullpath }) => fs.isEqual(fullpath, path))
    ) {
      // eslint-disable-next-line functional/immutable-data
      const oldFiles = files.splice(0);
      // eslint-disable-next-line functional/immutable-data
      files.push(
        ...oldFiles.filter(
          ({ fullpath }) => fs.isEqual(fullpath, path) === false
        )
      );
    }
  },
  {
    exists: false,
    mode: "abstract",
    dir: () => store.state.editor.project,
  }
);
</script>

<style lang="scss" scoped>
@import "src/sass/file-object.scss";
@import "src/sass/git-color.scss";

.file-object {
  @include file-object;
  @include git-color;
}
</style>
