<template>
  <div v-if="adding">
    <div class="file--system__item">
      <div class="d-flex align-center">
        <FileExplorer-Rename
          :is-folder="isFolder"
          :renaming="adding"
          @update:renaming="$emit(`update:adding`, $event)"
          :names-exists="namesExists"
          v-model="filename"
          @cancel="filename = $event"
          :dirname="dirname"
          :allow-rename="false"
          :no-icon="false"
          :allow-update-store="false"
          class="d-inline-flex"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  watch,
  toRefs,
} from "@vue/composition-api";
import FileExplorerRename from "./Rename.vue";
import { mkdir, writeFile } from "@/modules/filesystem";
import { Toast } from "@capacitor/toast";
import { join } from "path";
import i18n from "@/i18n";
import store from "@/store";

export default defineComponent({
  components: {
    FileExplorerRename,
  },
  props: {
    adding: {
      type: Boolean,
      required: true,
    },
    isFolder: {
      type: Boolean,
      required: true,
    },
    namesExists: {
      type: Array as PropType<string[]>,
      required: true,
    },
    dirname: {
      type: String,
      required: true,
    },
    allowOpenEditor: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { adding, dirname, isFolder, allowOpenEditor } = toRefs(props);
    const filename = ref<string>("");

    watch(adding, (newValue) => {
      if (newValue) {
        filename.value = "";
      }
    });
    watch(filename, async (newValue) => {
      if (newValue !== "") {
        const pathTo = join(dirname.value, filename.value);
        if (isFolder.value) {
          await mkdir(pathTo);
        } else {
          await writeFile(pathTo, "");
        }

        Toast.show({
          text: i18n.t("Created {type} {name}", {
            type: i18n.t(isFolder.value ? "folder" : "file"),
            name: pathTo,
          }) as string,
        });

        if (allowOpenEditor.value) {
          store.commit("editor/pushSession", pathTo);
        }
        emit("created");
        emit("update:adding", false);
      }
    });

    return {
      filename,
    };
  },
});
</script>

<style lang="scss" scoped>
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
