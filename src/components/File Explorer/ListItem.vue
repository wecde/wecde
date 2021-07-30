<template>
  <div>
    <div
      class="file--system__item"
      :class="{
        'file--system-hidden': gitStatus === `ignored` || isBeginCut,
        'file--system-folder': isFolder,
        'file--system__changed': gitStatus === `*modified`,
        'file--system__deleted':
          gitStatus === `*deleted` || gitStatus === `*undeleted`,
        'file--system__new': gitStatus === `*added`,
        'file--system__loading': gitStatus === `loading`,
      }"
      v-ripple
      @click="clickToFile"
    >
      <!-- 'file--system__changed': state === '*modified',
        'file--system__new': state === '*added',
        'file--system__changed-modified': state === 'modified',
        'file--system__new-modified': state === 'added', -->

      <FileExplorer-Rename
        :is-folder="isFolder"
        :renaming.sync="renaming"
        :names-exists="namesExists"
        v-model="file.fullpath"
        allow-rename
        allow-update-store
        class="d-flex align-center file--system__rename mr-2"
      >
        <template v-slot:prepend>
          <span class="file--system__prepend" v-if="isFolder">
            <v-icon style="color: inherit">
              {{ collapse ? mdiChevronDown : mdiChevronRight }}
            </v-icon>
          </span>
        </template>

        <template v-slot:append-text v-if="editing">
          <v-icon size="1em" color="blue">{{ mdiCircleMedium }}</v-icon>
        </template>
      </FileExplorer-Rename>

      <div class="file--system__more">
        <v-menu internal-activator bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              style="color: inherit"
              width="32px"
              height="32px"
            >
              <v-icon>{{ mdiDotsVertical }}</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4">
            <template v-if="clipboardExists">
              <v-list-item @click="paste" :disabled="notAllowPaste">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiContentPaste }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Paste") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider />
            </template>
            <template v-if="isFolder">
              <v-list-item
                @click="
                  adding = true;
                  addingFolder = false;
                "
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiFileOutline }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("New File") }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                @click="
                  adding = true;
                  addingFolder = true;
                "
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiFolderOutline }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t("New Folder") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <Import-Files :dirname="file.fullpath" @imported="refreshFolder">
                <template v-slot:default="{ on }">
                  <v-list-item v-on="on">
                    <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                      <v-icon>{{ mdiDownload }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $t("Import Files") }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </Import-Files>
              <v-divider />
            </template>
            <template>
              <v-list-item @click="cut">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiContentCut }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Cut") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="copy">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiContentCopy }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Copy") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="renaming = true">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiPen }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Rename") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="remove">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiDeleteOutline }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Delete") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="exportZip">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiExportVariant }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t(isFolder ? "Export ZIP" : "Export File") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </div>
    </div>
    <div class="ml-3" v-if="isFolder" v-show="collapse">
      <FileExplorer-Add
        :adding.sync="adding"
        :is-folder="addingFolder"
        :names-exists="namesChildrenExists"
        :dirname="file.fullpath"
        class="d-flex align-center order-0"
        allow-open-editor
        @created="refreshFolder"
      />
      <FileExplorer-List
        :files-list="files"
        @removed-file="files.splice($event, 1)"
        @refresh="refreshFolder"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed,
  watch,
  toRefs,
} from "@vue/composition-api";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon";
import FileExplorerRename from "./Rename.vue";
import {
  b64toBlob,
  removedPathProject,
  isParentFolder,
  pathEquals,
} from "@/utils";
import FileExplorerAdd from "./Add.vue";
import { unlink, readFile, readdirStat } from "@/modules/filesystem";
import { saveAs } from "file-saver";
import exportZip from "@/modules/export-zip";
import { Toast } from "@capacitor/toast";
import type { ReaddirStatItem } from "@/modules/filesystem";
import ImportFiles from "@/components/Import/Files.vue";
import store from "@/store";
import { basename } from "path";
import {
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
} from "@mdi/js";
import { join } from "path";

export default defineComponent({
  components: {
    FileExplorerList: () => import("./List.vue") as any,
    FileExplorerRename,
    FileExplorerAdd,
    ImportFiles,
  },
  props: {
    file: {
      type: Object as PropType<ReaddirStatItem>,
      required: true,
    },
    namesExists: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props) {
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
    const files = ref<ReaddirStatItem[]>([]);
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
        files.value = await readdirStat(file.value.fullpath, void 0, ["^.git"]);
      }
    }

    const watchFirstOpenCollapse = watch(collapse, (newValue) => {
      if (newValue) {
        refreshFolder();
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

      Toast.show({
        text: this.$t("Removed {type} {name}", {
          type: this.isFolder ? "folder" : "file",
          name: `${removedPathProject(this.file.fullpath)}`,
        }) as string,
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
        await this.$store.dispatch("clipboard-fs/paste", this.file.fullpath)
      ) {
        this.$emit("refresh-parent");
      } else {
        this.collapse = true;
        await this.refreshFolder();
      }
    },
    openEditor() {
      this.$store.commit("editor/pushSession", this.file.fullpath);

      if (this.$route.name !== "editor") {
        this.$router.push("/editor");
      }
    },

    async exportZip() {
      if (this.isFolder) {
        try {
          await exportZip(this.file.fullpath);
          this.$store.commit("terminal/clear");
          Toast.show({
            text: this.$t("Exported {type} {name}", {
              type: this.isFolder ? "folder" : "file",
              name: removedPathProject(this.file.fullpath),
            }) as string,
          });
        } catch (err) {
          this.$store.commit("terminal/error", err);
        }
      } else {
        this.$store.commit("system/setProgress", true);
        const data = await readFile(this.file.fullpath);

        saveAs(b64toBlob(data), basename(this.file.fullpath));
        this.$store.commit("system/setProgress", false);
        Toast.show({
          text: this.$t("Exported {type} {name}", {
            type: this.isFolder ? "folder" : "file",
            name: removedPathProject(this.file.fullpath),
          }) as string,
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
      if (this.$store.state["git-project"].state !== "unready") {
        if (this.isFolder) {
          // const allStatus: {
          //   [status: string]: number;
          // } = {};

          let added = false;
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
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./ListItem.scss";
</style>
