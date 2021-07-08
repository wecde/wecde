<template>
  <div :as="tag">
    <div
      class="file--system__item"
      :class="{
        'file--system-hidden': hidden,
        'file--system-folder': isFolder,
        'file--system__changed': state === 'M',
        'file--system__new': state === 'U',
      }"
      v-ripple
      @click="
        collapse = !collapse;
        openEditor();
      "
    >
      <div class="file--system__more order-1">
        <v-menu bottom left>
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
            </template>
            <v-list-item class="min-height-0" @click="exportZip">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-archive-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Export ZIP </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0" @click="renaming = true">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-pen</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Rename </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-export-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Move to") }} </v-list-item-title>
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
          </v-list>
        </v-menu>
      </div>

      <div class="d-flex align-center order-0 text-truncate">
        <span class="file--system__prepend">
          <v-icon style="color: inherit" v-if="isFolder">
            {{ collapse ? "mdi-chevron-down" : "mdi-chevron-right" }}
          </v-icon>
          <span v-else></span>
        </span>
        <span class="file--system__icon">
          <img
            :src="
              getIcon({
                light: false,
                isOpen: collapse,
                isFolder,
                name: nameLocal,
                language: extname(nameLocal),
              })
            "
          />
        </span>

        <span class="file--system__name text-truncate">
          <app-rename
            :value="name"
            v-model="nameLocal"
            @rename="rename"
            :state.sync="renaming"
            :input-value="name"
            :list-files="listFiles"
          />
        </span>
      </div>
    </div>
    <div class="ml-3" v-if="isFolder" v-show="collapse">
      <app-file-add
        :state.sync="adding"
        :is-folder="addingFolder"
        :directory="file"
        @created="$emit(`reload`)"
        :list-files="listFiles"
      />
      <app-file-system
        :level="level + 1"
        :files="children"
        :list-files="listFiles"
        v-if="children.length > 0"
        @reload="$emit(`reload`)"
      />
    </div>
  </div>
</template>

<script>
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon.js";
import AppRename from "./AppRename";
import { extname, b64toBlob, removedPathProject } from "@/utils";
import AppFileAdd from "./AppFileAdd";
import { rename, unlink, readFile } from "@/modules/filesystem";
import saveFile from "file-saver";
import exportZip from "@/modules/export-zip";
import { Toast } from "@capacitor/toast";

export default {
  components: {
    AppFileSystem: () => import("./AppFileSystem"),
    AppRename,
    AppFileAdd,
  },
  props: {
    level: {
      type: Number,
      required: true,
    },
    tag: {
      type: String,
      default: "div",
    },
    name: {
      type: String,
      required: true,
    },
    isFolder: {
      type: Boolean,
      default: false,
    },
    children: {
      type: Array,
      default: () => [],
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    file: {
      type: String,
      required: true,
    },
    listFiles: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      collapse: false,

      state: null,

      renaming: false,

      adding: false,
      addingFolder: false,

      nameLocal: "",
    };
  },
  computed: {
    directory() {
      return this.file.split("/").slice(0, -1).join("/");
    },
  },
  watch: {
    adding(newValue) {
      if (newValue) {
        this.collapse = true;
      }
    },
    name: {
      handler(newValue) {
        this.nameLocal = newValue;
      },
      immediate: true,
    },
  },
  methods: {
    getIcon,
    extname,

    async rename([newValue, oldValue]) {
      this.$show();
      await rename(
        `${this.directory}/${newValue}`,
        `${this.directory}/${oldValue}`
      );

      Toast.show({
        text: this.$t("Renamed {type} {old} to {new}", {
          type: this.$t(this.isFolder ? "folder" : "file"),
          old: `${removedPathProject(this.directory)}/${oldValue}`,
          new: `${removedPathProject(this.directory)}/${newValue}`,
        }),
      });

      this.$emit("reload");
      this.$hide();
    },
    async remove() {
      this.$show();
      await unlink(this.file);

      Toast.show({
        text: this.$t("Removed {type} {name}", {
          type: this.isFolder ? "folder" : "file",
          name: `${removedPathProject(this.file)}`,
        }),
      });

      this.$emit("reload");
      this.$hide();
    },
    openEditor() {
      if (this.isFolder === false) {
        this.$store.commit("editor/pushSession", this.file);

        if (this.$route.name !== "editor") {
          this.$router.push("/editor");
        }
      }
    },

    async exportZip() {
      if (this.isFolder) {
        try {
          await exportZip(this.file);
          this.$store.commit("terminal/clear");
          Toast.show({
            text: this.$t("Exported {type} {name}", {
              type: this.isFolder ? "folder" : "file",
              name: removedPathProject(this.file),
            }),
          });
        } catch (err) {
          this.$store.commit("terminal/error", err);
        }
      } else {
        this.$show();
        const data = await readFile(this.file);

        saveFile(b64toBlob(data), this.name);
        this.$hide();
        Toast.show({
          text: this.$t("Exported {type} {name}", {
            type: this.isFolder ? "folder" : "file",
            name: removedPathProject(this.file),
          }),
        });
      }
    },
  },
};
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
