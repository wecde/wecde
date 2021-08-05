<template>
  <div
    class="file-object"
    :class="{
      dark: $q.dark.isActive,

      ignored: gitStatus === `ignored` || isBeginCut,
      'is-folder': isFolder,

      'star-modified': gitStatus === `*modified`,
      modified: gitStatus === `modified`,

      'star-deleted': gitStatus === `*deleted`,
      deleted: gitStatus === `deleted`,

      'star-undeleted': gitStatus === `*undeleted`,
      undeleted: gitStatus === `undeleted`,

      'star-added': gitStatus === `*added`,
      added: gitStatus === `added`,

      loading: gitStatus === `loading`,
    }"
    v-ripple
    @click="clickToFile"
  >
    <FileExplorer-Rename
      :is-folder="isFolder"
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
          v-if="isFolder"
        />
      </template>

      <template v-slot:append-text v-if="editing">
        <q-icon size="1em" color="blue" :name="mdiCircleMedium" />
      </template>
    </FileExplorer-Rename>

    <div class="actions">
      <q-btn color="inherit" flat dense :icon="mdiDotsVertical" @click.stop>
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list bordered>
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
                <q-item-section>{{ $t("Paste") }}</q-item-section>
              </q-item>
              <q-separator />
            </template>

            <template v-if="isFolder">
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
                <q-item-section>{{ $t("New File") }}</q-item-section>
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
                <q-item-section>{{ $t("New Folder") }}</q-item-section>
              </q-item>

              <Import-Files :dirname="file.fullpath" @imported="refreshFolder">
                <template v-slot:default="{ on }">
                  <q-item clickable v-close-popup v-ripple v-on="on">
                    <q-item-section avatar class="min-width-0">
                      <q-icon :name="mdiDownload" />
                    </q-item-section>
                    <q-item-section>{{ $t("Import Files") }}</q-item-section>
                  </q-item>
                </template>
              </Import-Files>

              <q-separator />
            </template>

            <q-item clickable v-close-popup v-ripple @click="cut">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiContentCut" />
              </q-item-section>
              <q-item-section>{{ $t("Cut") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="copy">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiContentCopy" />
              </q-item-section>
              <q-item-section>{{ $t("Copy") }}</q-item-section>
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
              <q-item-section>{{ $t("Rename") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="remove">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiDeleteOutline" />
              </q-item-section>
              <q-item-section>{{ $t("Delete") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple @click="exportZip">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiExportVariant" />
              </q-item-section>
              <q-item-section>{{
                $t(isFolder ? "Export ZIP" : "Export File")
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
  <div class="q-ml-3" v-if="isFolder" v-show="collapse">
    <FileExplorer-Add
      v-model:adding="adding"
      :is-folder="addingFolder"
      :names-exists="namesChildrenExists"
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
import ImportFiles from "components/Import/Files.vue";
import { saveAs } from "file-saver";
import { basename, join } from "path-cross";
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon";
import exportZip from "src/modules/export-zip";
import { readdirStat, readFile, unlink } from "src/modules/filesystem";
import type { StatItem } from "src/modules/filesystem";
import { useStore } from "src/store";
import {
  b64toBlob,
  isParentFolder,
  pathEquals,
  removedPathProject,
} from "src/utils";
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
    ImportFiles,
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
    const renaming = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const isFolder = computed<boolean>(
      () => file.value.stat.type === "directory"
    );
    const hidden = computed<boolean>(() =>
      basename(file.value.fullpath).startsWith(".")
    );
    const files = ref<StatItem[]>([]);
    const namesChildrenExists = computed<string[]>(() =>
      files.value.map((file) => basename(file.fullpath))
    );
    const editing = computed<boolean>(
      () =>
        !!store.getters["editor/session"] &&
        (isFolder.value
          ? isParentFolder(file.value.fullpath, store.getters["editor/session"])
          : pathEquals(store.getters["editor/session"], file.value.fullpath))
    );

    async function refreshFolder() {
      if (isFolder.value) {
        files.value.splice(0);
        files.value.push(
          ...(await readdirStat(file.value.fullpath, ["^.git"]))
        );
      }
    }

    const watchFirstOpenCollapse = watch(collapse, (newValue) => {
      if (newValue) {
        void refreshFolder();
        watchFirstOpenCollapse();
      }
    });

    watch(adding, (newValue) => {
      if (newValue) {
        collapse.value = true;
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
      renaming,
      adding,
      addingFolder,
      isFolder,
      hidden,
      files,
      namesChildrenExists,
      refreshFolder,
      editing,
    };
  },
  methods: {
    getIcon,

    async remove() {
      this.$store.commit("system/setProgress", true);
      await unlink(this.file.fullpath);

      void Toast.show({
        text: this.$rt("Removed {type} {name}", {
          type: this.isFolder ? "folder" : "file",
          name: `${removedPathProject(this.file.fullpath)}`,
        }),
      });

      this.$emit("removed");
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
      if (this.isFolder) {
        try {
          await exportZip(this.file.fullpath);
          this.$store.commit("terminal/clear");
          void Toast.show({
            text: this.$rt("Exported {type} {name}", {
              type: this.isFolder ? "folder" : "file",
              name: removedPathProject(this.file.fullpath),
            }),
          });
        } catch (err) {
          this.$store.commit("terminal/error", err);
        }
      } else {
        this.$store.commit("system/setProgress", true);
        const data = await readFile(this.file.fullpath);

        saveAs(b64toBlob(data), basename(this.file.fullpath));
        this.$store.commit("system/setProgress", false);
        void Toast.show({
          text: this.$rt("Exported {type} {name}", {
            type: this.isFolder ? "folder" : "file",
            name: removedPathProject(this.file.fullpath),
          }),
        });
      }
    },

    clickToFile() {
      this.collapse = !this.collapse;

      if (this.isFolder === false) {
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
    gitStatus(): string | void {
      if (this.$store.state.editor.project) {
        if (this.$store.state["git-project"].state !== "unready") {
          if (this.isFolder) {
            // const allStatus: {
            //   [status: string]: number;
            // } = {};

            // eslint-disable-next-line functional/no-let
            let added = false;
            // eslint-disable-next-line functional/no-loop-statement
            for (const fileTest in this.$store.state["git-project"]
              .matrixStatus) {
              if (
                isParentFolder(
                  this.file.fullpath,
                  join(this.$store.state.editor.project, fileTest)
                )
              ) {
                const status =
                  this.$store.state["git-project"].matrixStatus[fileTest];

                if (status === "*modified") {
                  return "*modified";
                }

                if (status === "*added") {
                  added = true;
                }

                // if (status in allStatus) {
                //   allStatus[status]++;
                // } else {
                //   allStatus[status] = 1;
                // }
              }

              if (added) {
                return "*added";
              }
            }
            // return Object.entries(allStatus).sort((a, b) => b[1] - a[1])[0]?.[0];
          } else {
            // eslint-disable-next-line functional/no-loop-statement
            for (const fileTest in this.$store.state["git-project"]
              .matrixStatus) {
              if (
                pathEquals(
                  join(this.$store.state.editor.project, fileTest),
                  this.file.fullpath
                )
              ) {
                return this.$store.state["git-project"].matrixStatus[fileTest];
              }
            }
          }

          if (this.$store.state["git-project"].isLoading) {
            return "loading";
          }
        }
      }

      return void 0;
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
