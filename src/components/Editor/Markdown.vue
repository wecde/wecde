<template>
  <Editor-Code
    :fullpath="fullpath"
    :show="!previewing"
    :input-value="!previewing"
  />
  <div class="full-width full-height" v-if="previewing" v-html="html" />
</template>

<script lang="ts" setup>
import marked from "marked";
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
const html = ref<string>("");

async function refreshMarkdown(): Promise<void> {
  html.value = marked(await fs.readFile(props.fullpath, "base64"));
}

watch(
  previewing,
  async (newValue) => {
    if (newValue) {
      await refreshMarkdown();
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
      await refreshMarkdown();
    }
  }
);

registerWatch(
  () => props.fullpath,
  () => void refreshMarkdown(),
  {
    mode: "absolute",
    exists: true,
    type: "file",
  }
);
</script>
