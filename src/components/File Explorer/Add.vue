<template>
  <div class="file-object" v-show="adding">
    <FileExplorer-Rename
      :is-folder="isFolder"
      :renaming="adding"
      @update:renaming="$emit(`update:adding`, $event)"
      :names-exists="namesExists"
      v-model:fullpath="filename"
      @cancel="filename = $event"
      :dirname="dirname"
      :allow-rename="false"
      :no-icon="false"
      :allow-update-store="false"
    />
  </div>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import fs from "modules/fs";
import { join } from "path-cross";
import { useStore } from "src/store";
import { defineComponent, PropType, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";

import FileExplorerRename from "./Rename.vue";

export default defineComponent({
  emits: ["update:adding", "created"],
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
      type: Array as PropType<readonly string[]>,
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
    const store = useStore();
    const i18n = useI18n();
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
          await fs.mkdir(pathTo, {
            recursive: true
          });
        } else {
          await fs.writeFile(pathTo, "");
        }

        void Toast.show({
          text: i18n.t(`alert.created.${isFolder.value ? "folder" : "file"}`, {
            name: pathTo,
          }),
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
@import "./ListItem.scss";

.file-object {
  @include file-object($enable-git: false);
  margin-right: 32px;
}
</style>
