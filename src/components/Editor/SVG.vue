<template>
  <Editor-Code
    :fullpath="fullpath"
    :showw="!previewing"
    :input-value="!previewing"
  />
  <div
    class="full-width full-height flex items-center justify-center"
    v-if="previewing"
    v-html="svg"
  />
</template>

<script lang="ts" setup>
import fs from "modules/fs";
import { registerWatch } from "src/helpers/fs";
import { ref, watch } from "vue";

import EditorCode from "./Code.vue";

defineEmits<{
  (ev: "change"): void;
}>();
const props = defineProps<{
  fullpath: string;
}>();

const previewing = ref<boolean>(false);
const svg = ref<string>("");

async function refreshSVG(): Promise<void> {
  svg.value = await fs.readFile(props.fullpath, "base64");
}

watch(
  previewing,
  async (newValue) => {
    if (newValue) {
      await refreshSVG();
    }
  },
  {
    immediate: true,
  }
);
watch(
  () => props.fullpath,
  async () => {
    if (previewing.value) {
      await refreshSVG();
    }
  }
);

registerWatch(
  () => props.fullpath,
  () => void refreshSVG(),
  {
    mode: "absolute",
    exists: true,
    type: "file",
  }
);
</script>
