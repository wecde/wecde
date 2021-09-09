<template>
  <Editor-Code
    :fullpath="fullpath"
    :hide-footer="previewing"
    :style="{
      display: previewing ? 'none' : undefined,
    }"
  />
  <div
    class="full-width full-height flex items-center justify-center"
    v-if="previewing"
    v-html="svg"
  />

  <teleport to="[data-id='code.btn-addons']" v-if="isMounted">
    <q-btn
      flat
      round
      padding="xs"
      :icon="previewing ? 'ti-pencil-alt' : 'ti-image'"
      @click="previewing = !previewing"
    />
  </teleport>
</template>

<script lang="ts" setup>
import fs from "modules/fs";
import { registerWatch } from "src/helpers/fs-helper";
import { onMounted, ref, watch } from "vue";

import EditorCode from "./Code.vue";

const isMounted = ref<boolean>(false);
onMounted(() => (isMounted.value = true));

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
