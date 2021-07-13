<template>
  <div>
    <div
      class="file--system__item"
      :class="{
        'file--system-hidden': hidden || isBeginCut,
        'file--system-folder': isFolder,
        'file--system__changed': state === '*modified',
        'file--system__new': state === '*added',
        'file--system__changed-modified': state === 'modified',
        'file--system__new-modified': state === 'added',
      }"
      :data-type="state"
      v-ripple
      @click="clickToFile"
    >
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
      </FileExplorer-Rename>
    </div>
    <div class="ml-3" v-if="isFolder" v-show="collapse">
      <FileExplorer-Add
        :adding.sync="adding"
        :is-folder="addingFolder"
        :names-exists="namesExists"
        :dirname="file.fullpath"
        class="d-flex align-center order-0 text-truncate"
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
import { b64toBlob, removedPathProject } from "@/utils";
import FileExplorerAdd from "./Add.vue";
import { rename, unlink, readFile, readdirStat } from "@/modules/filesystem";
import { saveAs } from "file-saver";
import exportZip from "@/modules/export-zip";
import { Toast } from "@capacitor/toast";
import type { ReaddirStatItem } from "@/modules/filesystem";
import ImportFiles from "@/components/Import/Files.vue";
import { status } from "@/modules/git";
import store from "@/store";
import { relative } from "path";

/// kiểm tra trạng thái của tệp |||

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
    const state = ref<null | string>(null);
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

    async function refreshFolder() {
      if (isFolder.value) {
        files.value = await readdirStat(file.value.fullpath, void 0, [".git"]);
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

    watch(
      file,
      async () => {
        state.value = await status({
          dir: store.state.editor.project as string,
          filepath: relative(
            store.state.editor.project || "",
            file.value.fullpath
          ),
        });
      },
      {
        immediate: true,
      }
    );

    return {
      collapse,
      state,
      renaming,
      adding,
      addingFolder,
      nameLocal,
      isFolder,
      hidden,
      files,
      namesExists,
      refreshFolder,
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

    async rename([newValue, oldValue]: [string, string]): Promise<void> {
      this.$store.commit("progress/show");
      await rename(
        `${this.file.dirname}/${newValue}`,
        `${this.file.dirname}/${oldValue}`
      );

      Toast.show({
        text: this.$t("Renamed {type} {old} to {new}", {
          type: this.$t(this.isFolder ? "folder" : "file"),
          old: `${removedPathProject(this.file.dirname)}/${oldValue}`,
          new: `${removedPathProject(this.file.dirname)}/${newValue}`,
        }) as string,
      });

      this.$store.commit("progress/hide");
    },
    async remove() {
      this.$store.commit("progress/show");
      await unlink(this.file.fullpath);

      Toast.show({
        text: this.$t("Removed {type} {name}", {
          type: this.isFolder ? "folder" : "file",
          name: `${removedPathProject(this.file.fullpath)}`,
        }) as string,
      });

      this.$emit("removed");
      this.$store.commit("progress/hide");
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
        this.$store.commit("progress/show");
        const data = await readFile(this.file.fullpath);

        saveAs(b64toBlob(data), this.file.name);
        this.$store.commit("progress/hide");
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
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";

.file--system {
  &__item {
    font-size: 15px;
    display: flex;
    align-items: center;
    // padding: 5px 13px 5px 10px;
    padding: 2.5px 13px 2.5px 10px;
    color: #b9bbc1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div:last-child {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }

  &-hidden {
    color: rgb(127, 127, 127) !important;
  }

  &__more::before {
    font-size: 14px;
  }

  &__changed {
    color: rgb(121, 184, 255);

    .file--system__more::before {
      content: "M";
    }
  }
  &__new {
    color: rgb(52, 208, 88);

    .file--system__more::before {
      content: "U";
    }
  }

  &__changed.file--system-folder .file--system__more::before,
  &__new.file--system-folder .file--system__more::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.7;
  }

  &__prepend {
    transform: translateY(-25%);
  }
  &__icon {
    margin-right: 8px;
    transform: translateY(-25%);

    img {
      width: 24px;
      height: 24px;
      margin: auto;
      display: block;
      object-fit: cover;
      margin-top: 3px;
    }
  }
  &__prepend,
  &__icon {
    font-size: 20px;
    width: 1em;
    height: 1em;
    display: inline-block;
    > * {
      font-size: inherit;
    }
  }
  &__prepend {
    width: 24px;
    height: 24px;
    > span {
      display: block;
      width: 1em;
      height: 1em;
    }
  }
}
</style>
