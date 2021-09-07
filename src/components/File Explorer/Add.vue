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

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import fs from "modules/fs";
import { join } from "path-cross";
import { useStore } from "src/store";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import FileExplorerRename from "./Rename.vue";

const props = defineProps<{
  adding: boolean;
  isFolder: boolean;
  namesExists: readonly string[];
  dirname: string;
  allowOpenEditor: boolean;
}>();
const emit = defineEmits<{
  (ev: "update:adding", v: boolean): void;
}>();

const store = useStore();
const i18n = useI18n();
const filename = ref<string>("");

watch(() => props.adding, (newValue) => {
  if (newValue) {
    filename.value = "";
  }
});
watch(filename, async (newValue) => {
  if (newValue !== "") {
    const pathTo = join(props.dirname, filename.value);
    if (props.isFolder) {
      await fs.mkdir(pathTo, {
        recursive: true,
      });
    } else {
      await fs.writeFile(pathTo, "");
    }

    void Toast.show({
      text: i18n.t(`alert.created.${props.isFolder ? "folder" : "file"}`, {
        name: pathTo,
      }),
    });

    if (props.allowOpenEditor) {
      store.commit("editor/pushSession", pathTo);
    }

    emit("update:adding", false);
  }
});
</script>

<style lang="scss" scoped>
@import "src/sass/file-object.scss";
@import "src/sass/git-color.scss";

.file-object {
  @include file-object;
  @include git-color;
  margin-right: 32px;
}
</style>
