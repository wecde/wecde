<template>
  <div v-if="state">
    <div class="file--system__item">
      <div class="d-flex align-center">
        <span class="file--system__prepend"> </span>
        <span class="file--system__icon">
          <img
            :src="
              getIcon({
                light: false,
                isOpen: false,
                isFolder,
                name: filename,
                language: extname(filename),
              })
            "
          />
        </span>

        <span class="file--system__name text-truncate">
          <app-rename
            @rename="createFile"
            :state="state"
            @update:state="$emit(`update:state`, $event)"
            :value="filename"
            :input-value="``"
            :list-files="listFiles"
            v-model="filename"
          />
        </span>
      </div>

      <div class="file--system__more"></div>
    </div>
  </div>
</template>

<script>
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon.js";
import { extname, removedPathProject } from "@/utils";
import AppRename from "./AppRename";
import { mkdir, writeFile } from "@/modules/filesystem";
import { Toast } from "@capacitor/toast";

export default {
  components: {
    AppRename,
  },
  props: {
    isFolder: {
      type: Boolean,
      default: false,
    },
    listFiles: {
      type: Array,
      required: false,
      default: () => [],
    },
    state: {
      type: Boolean,
      default: false,
    },
    directory: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      filename: "",
    };
  },
  watch: {
    state() {
      this.filename = "";
    },
  },
  methods: {
    getIcon,
    extname,
    async createFile() {
      const { filename } = this;
      if (this.isFolder) {
        await mkdir(`${this.directory}/${filename}`);
      } else {
        await writeFile(`${this.directory}/${filename}`, "");
      }

      Toast.show({
        text: `Created ${
          this.isFolder ? "folder" : "file"
        } "${removedPathProject(this.directory)}/${filename}"`,
      });

      this.$emit("created");
      this.$emit("update:state", false);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";

.file--system {
  &__item {
    font-size: 16px;
    display: flex;
    align-items: center;
    padding: 5px 13px 5px 10px;
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
    margin-right: 5px;
  }
  &__icon {
    margin-right: 8px;

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
  }
}
</style>
