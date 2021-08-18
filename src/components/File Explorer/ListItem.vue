<template>
  <div
    class="file-object"
    :class="{
      dark: $q.dark.isActive,

      ignored: ignored || gitStatus === `ignored` || isBeginCut,
      'is-folder': file.stat.isDirectory(),

      'star-modified': gitStatus === `*modified`,
      modified: gitStatus === `modified`,

      'star-deleted': gitStatus === `*deleted`,
      deleted: gitStatus === `deleted`,

      'star-undeleted': gitStatus === `*undeleted`,

      'star-added': gitStatus === `*added`,
      added: gitStatus === `added`,

      loading: gitStatus === `loading`,
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
          :name="collapse ? mdiChevronDown : mdiChevronRight"
          v-if="file.stat.isDirectory()"
        />
      </template>

      <template v-slot:append-text>
        <q-spinner-hourglass color="primary" v-if="loading" />
        <q-icon
          size="13px"
          color="blue"
          :name="mdiCircleMedium"
          v-if="opening"
        />
      </template>
    </FileExplorer-Rename>

    <div class="actions">
      <q-btn color="inherit" flat dense :icon="mdiDotsVertical" @click.stop>
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
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon :name="mdiContentPaste" />
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
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon :name="mdiFileOutline" />
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
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon :name="mdiFolderOutline" />
                </q-item-section>
                <q-item-section>{{ $t("label.new-folder") }}</q-item-section>
              </q-item>

              <Action-Import-Files
                :dirname="file.fullpath"
                @imported="refreshFolder"
              >
                <template v-slot:default="{ on }">
                  <q-item clickable v-close-popup v-ripple @click="on">
                    <q-item-section avatar class="min-width-0">
                      <q-icon :name="mdiDownload" />
                    </q-item-section>
                    <q-item-section>{{
                      $t("label.import-files")
                    }}</q-item-section>
                  </q-item>
                </template>
              </Action-Import-Files>

              <q-separator />
            </template>

            <q-item clickable v-close-popup v-ripple @click="cut">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiContentCut" />
              </q-item-section>
              <q-item-section>{{ $t("label.cut") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="copy">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiContentCopy" />
              </q-item-section>
              <q-item-section>{{ $t("label.copy") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              v-close-popup
              @click.stop.prevent="renaming = true"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiPen" />
              </q-item-section>
              <q-item-section>{{ $t("label.rename") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="remove">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiDeleteOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.delete") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="exportZip">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiExportVariant" />
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
      @created="refreshFolder"
    />
    <FileExplorer-List
      :files-list="files"
      @remove-children="files.splice($event, 1)"
      @request:refresh="refreshFolder"
    />
  </div>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiCircleMedium,
  mdiContentCopy,
  mdiContentCut,
  mdiContentPaste,
  mdiDeleteOutline,
  mdiDotsVertical,
  mdiDownload,
  mdiExportVariant,
  mdiFileOutline,
  mdiFolderOutline,
  mdiPen,
} from "@quasar/extras/mdi-v5";
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import ActionImportFiles from "components/Action-ImportFiles.vue";
import { saveAs } from "file-saver";
import exportZip from "modules/export-zip";
import fs, { readdirAndStat } from "modules/filesystem";
import type { StatItem } from "modules/filesystem";
import { basename, relative } from "path-cross";
import { useStore } from "src/store";
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  PropType,
  ref,
  toRefs,
  watch,
} from "vue";

import FileExplorerAdd from "./Add.vue";
import FileExplorerRename from "./Rename.vue";

export default defineComponent({
  emits: ["removed", "request:refresh"],
  components: {
    FileExplorerList: defineAsyncComponent({
      loader: () => import("./List.vue") as never,
    }),
    FileExplorerRename,
    FileExplorerAdd,
    ActionImportFiles,
  },
  props: {
    file: {
      type: Object as PropType<StatItem>,
      required: true,
    },
    namesExists: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { file } = toRefs(props);
    const collapse = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const loading = ref<boolean>(false);

    watch(adding, (newValue) => {
      if (newValue) {
        collapse.value = true;
      }
    });

    const files = ref<StatItem[]>([]);
    const opening = computed<boolean>(() => {
      if (store.getters["editor/session"]) {
        if (file.value.stat.isDirectory()) {
          return fs.isParentDir(
            file.value.fullpath,
            store.getters["editor/session"]
          );
        }

        return fs.isEqual(store.getters["editor/session"], file.value.fullpath);
      }

      return false;
    });
    const ignored = computed<boolean>(() => {
      return (
        store.state["git-project"].state === "ready" &&
        store.state.editor.project &&
        store.getters["git-project/ignored"](
          relative(store.state.editor.project, file.value.fullpath)
        )
      );
    });
    const gitStatus = ref<string | null>(null);

    async function refreshFolder() {
      if (file.value.stat.isDirectory()) {
        loading.value = true;
        files.value.splice(0);
        files.value.push(...(await readdirAndStat(file.value.fullpath)));
        loading.value = false;
      }
    }

    const watchFirstOpenCollapse = watch(collapse, (newValue) => {
      if (newValue) {
        void refreshFolder();
        watchFirstOpenCollapse();
      }
    });

    return {
      mdiChevronDown,
      mdiChevronRight,
      mdiCircleMedium,
      mdiDotsVertical,
      mdiContentPaste,
      mdiFileOutline,
      mdiFolderOutline,
      mdiDownload,
      mdiContentCut,
      mdiContentCopy,
      mdiPen,
      mdiDeleteOutline,
      mdiExportVariant,

      collapse,
      renaming: ref<boolean>(false),
      adding,
      addingFolder: ref<boolean>(false),
      files,
      basename,
      refreshFolder,
      opening,
      gitStatus,
      loading,

      ignored,
    };
  },
  methods: {
    getIcon,

    async remove() {
      this.$store.commit("system/setProgress", true);
      try {
        await fs.unlink(this.file.fullpath, {
          removeAll: true,
        });

        void Toast.show({
          text: this.$t(
            `alert.removed.${this.file.stat.isDirectory() ? "folder" : "file"}`,
            {
              name: `${this.file.fullpath}`,
            }
          ),
        });

        this.$emit("removed");
      } catch {
        void Toast.show({
          text: this.$t(
            `alert.remove-failed-${
              this.file.stat.isDirectory() ? "folder" : "file"
            }`,
            {
              name: `${this.file.fullpath}`,
            }
          ),
        });
      }
      this.$store.commit("system/setProgress", false);
    },
    cut() {
      this.$store.commit("clipboard-fs/cut", [
        {
          path: this.file.fullpath,
          vue: this,
        },
      ]);
    },
    copy() {
      this.$store.commit("clipboard-fs/copy", [
        {
          path: this.file.fullpath,
          vue: this,
        },
      ]);
    },
    async paste() {
      if (
        await this.$store.dispatch("clipboard-fs/paste", this.file.fullpath) // if required required refresh this parent
      ) {
        this.$emit("request:refresh");
      } else {
        this.collapse = true;
        await this.refreshFolder();
      }
    },
    openEditor() {
      this.$store.commit("editor/pushSession", this.file.fullpath);

      if (this.$route.name !== "editor") {
        void this.$router.push("/editor");
      }
    },

    async exportZip() {
      if (this.file.stat.isDirectory()) {
        try {
          await exportZip(this.file.fullpath);
          this.$store.commit("terminal/clear");
          void Toast.show({
            text: this.$t(
              `alert.exported.${
                this.file.stat.isDirectory() ? "folder" : "file"
              }`,
              {
                name: this.file.fullpath,
              }
            ),
          });
        } catch (err) {
          this.$store.commit("terminal/error", err);
        }
      } else {
        this.$store.commit("system/setProgress", true);
        const data = await fs.readFile(this.file.fullpath, "buffer");

        saveAs(new Blob([data]), basename(this.file.fullpath));
        this.$store.commit("system/setProgress", false);
        void Toast.show({
          text: this.$t(
            `alert.exported.${
              this.file.stat.isDirectory() ? "folder" : "file"
            }`,
            {
              name: this.file.fullpath,
            }
          ),
        });
      }
    },

    clickToFile() {
      this.collapse = !this.collapse;

      if (this.file.stat.isDirectory() === false) {
        this.openEditor();
      }
    },
  },
  computed: {
    isBeginCut(): boolean {
      return (
        this.$store.getters["clipboard-fs/cutting"] &&
        this.$store.getters["clipboard-fs/has"](this.file.fullpath)
      );
    },
    clipboardExists(): boolean {
      return this.$store.getters["clipboard-fs/isEmpty"] === false;
    },
    notAllowPaste(): boolean {
      return (
        this.$store.getters["clipboard-fs/allowPaste"](this.file.fullpath) ===
        false
      );
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./ListItem.scss";

.file-object {
  @include file-object($enable-git: true);
}
</style>
