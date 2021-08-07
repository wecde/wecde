<template>
  <div
    class="file-object"
    :class="{
      dark: $q.dark.isActive,

      ignored: ignored || gitStatus === `ignored` || isBeginCut,
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
                <q-item-section>{{ $t("label.paste") }}</q-item-section>
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
                  <q-item clickable v-close-popup v-ripple v-on="on">
                    <q-item-section avatar class="min-width-0">
                      <q-icon :name="mdiDownload" />
                    </q-item-section>
                    <q-item-section>{{ $t("label.import-files") }}</q-item-section>
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
                $t(isFolder ? "label.export-folder" : "label.export-file")
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
import ActionImportFiles from "components/Action-ImportFiles.vue";
import { saveAs } from "file-saver";
import { basename, relative } from "path-cross";
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon";
import eventBus from "src/modules/event-bus";
import exportZip from "src/modules/export-zip";
import { readdirStat, readFile, unlink } from "src/modules/filesystem";
import type { StatItem } from "src/modules/filesystem";
import { status } from "src/modules/git";
import { useStore } from "src/store";
import {
  b64toBlob,
  createTimeoutBy,
  isParentFolder,
  pathEquals,
  removedPathProject,
} from "src/utils";
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  onBeforeUnmount,
  PropType,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";

import FileExplorerAdd from "./Add.vue";
import FileExplorerRename from "./Rename.vue";

import gitStatusCache from "./git-status-cache";

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
    const renaming = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const isFolder = computed<boolean>(
      () => file.value.stat.type === "directory"
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
    const gitStatus = ref<string | null>(null);

    function refreshGitStatus(): void {
      createTimeoutBy(
        `watch fs for git status ${props.file.fullpath}`,
        async () => {
          console.log(store.state["git-project"].state);
          if (
            store.state.editor.project &&
            store.state["git-project"].state === "ready"
          ) {
            gitStatus.value = await status({
              dir: store.state.editor.project,
              filepath: relative(
                store.state.editor.project,
                props.file.fullpath
              ),
              cache: gitStatusCache,
            });
          }
        },
        3000
      );
    }
    watchEffect(() => void refreshGitStatus());
    const watcherFS = eventBus.on(
      ["write:file"],
      () => void refreshGitStatus()
    );

    onBeforeUnmount(() => void watcherFS());

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
      files,
      namesChildrenExists,
      refreshFolder,
      editing,
      gitStatus,
    };
  },
  methods: {
    getIcon,

    async remove() {
      this.$store.commit("system/setProgress", true);
      await unlink(this.file.fullpath);

      void Toast.show({
        text: this.$rt(`alert.removed-${this.isFolder ? "folder" : "file"}`, {
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
            text: this.$rt(
              `alert.exported-${this.isFolder ? "folder" : "file"}`,
              {
                name: removedPathProject(this.file.fullpath),
              }
            ),
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
          text: this.$rt(
            `alert.exported-${this.isFolder ? "folder" : "file"}`,
            {
              name: removedPathProject(this.file.fullpath),
            }
          ),
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
    ignored(): boolean {
      return (
        this.$store.state["git-project"].state === "ready" &&
        this.$store.state.editor.project &&
        this.$store.getters["git-project/ignored"](
          relative(this.$store.state.editor.project, this.file.fullpath)
        )
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
