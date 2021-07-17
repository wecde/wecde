<template>
  <div>
    <div
      class="file--system__item"
      :class="{
        'file--system-hidden': hidden || isBeginCut,
        'file--system-folder': isFolder,
      }"
      v-ripple
      @click="clickToFile"
    >
      <!-- 'file--system__changed': state === '*modified',
        'file--system__new': state === '*added',
        'file--system__changed-modified': state === 'modified',
        'file--system__new-modified': state === 'added', -->
      <div class="file--system__more order-1">
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
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <template v-if="clipboardExists">
              <v-list-item
                class="min-height-0"
                @click="paste"
                :disabled="notAllowPaste"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-content-paste</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Paste") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider />
            </template>
            <template v-if="isFolder">
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
                  <v-list-item-title> {{ $t("New File") }}</v-list-item-title>
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
                  <v-list-item-title>
                    {{ $t("New Folder") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <Import-Files :dirname="file.fullpath" @imported="refreshFolder">
                <template v-slot:default="{ on }">
                  <v-list-item class="min-height-0" v-on="on">
                    <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                      <v-icon>mdi-download</v-icon>
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
              <v-list-item class="min-height-0" @click="cut">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-content-cut</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Cut") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="min-height-0" @click="copy">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-content-copy</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Copy") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="min-height-0" @click="renaming = true">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-pen</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Rename") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="min-height-0" @click="remove">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Delete") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="min-height-0" @click="exportZip">
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-export-variant</v-icon>
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

      <FileExplorer-Rename
        :is-folder="isFolder"
        :renaming.sync="renaming"
        :names-exists="namesExists"
        v-model="file.name"
        :dirname="file.dirname"
        allow-rename
        allow-update-store
        class="d-flex align-center order-0 text-truncate"
      >
        <template v-slot:prepend>
          <span class="file--system__prepend">
            <v-icon style="color: inherit" v-if="isFolder">
              {{ collapse ? "mdi-chevron-down" : "mdi-chevron-right" }}
            </v-icon>
            <span v-else />
          </span>
        </template>

        <template v-slot:append-text v-if="editing">
          <v-icon size="1em" color="blue">mdi-circle-medium</v-icon>
        </template>
      </FileExplorer-Rename>
    </div>
    <div class="ml-3" v-if="isFolder" v-show="collapse">
      <FileExplorer-Add
        :adding.sync="adding"
        :is-folder="addingFolder"
        :names-exists="namesExists"
        :dirname="file.fullpath"
        class="d-flex align-center order-0 text-truncate"
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
  },
  setup(props) {
    const { file } = toRefs(props);
    const collapse = ref<boolean>(false);
    const renaming = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const nameLocal = ref<string>("");
    const isFolder = computed<boolean>(
      () => file.value.stat.type === "directory"
    );
    const hidden = computed<boolean>(() => file.value.name.startsWith("."));
    const files = ref<ReaddirStatItem[]>([]);
    const namesExists = computed<string[]>(() =>
      files.value.map((file) => file.name)
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
      collapse,
      renaming,
      adding,
      addingFolder,
      nameLocal,
      isFolder,
      hidden,
      files,
      namesExists,
      refreshFolder,
      editing,
    };
  },
  watch: {
    "file.name": {
      handler(newValue) {
        this.nameLocal = newValue || "";
      },
      immediate: true,
    },
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

        saveAs(b64toBlob(data), this.file.name);
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
  },
});
</script>

<style lang="scss" scoped>
@import "./ListItem.scss";
</style>
