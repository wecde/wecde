<template>
  <Editor-Code
    :fullpath="fullpath"
    @change="
      $emit('change');
      previewing && refreshSVG();
    "
    :showw="!previewing"
    :input-value="!previewing"
    ref="codeEditor"
  />
  <div
    class="full-width full-height flex items-center justify-center"
    v-if="previewing"
    v-html="svg"
  />
</template>

<script lang="ts">
import fs from "modules/fs";
import { defineComponent, ref, toRefs, watch } from "vue";
import type { DefineComponent } from "vue";

import EditorCode from "./Code.vue";

export default defineComponent({
  emits: ["change"],
  name: "Editor-Preview-SVG",
  components: {
    EditorCode,
  },
  props: {
    fullpath: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { fullpath } = toRefs(props);
    const previewing = ref<boolean>(false);
    const svg = ref<string>("");
    const codeEditor = ref<DefineComponent | null>(null);

    async function refreshSVG(): Promise<void> {
      svg.value = await fs.readFile(fullpath.value, "base64");
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
    watch(fullpath, async () => {
      if (previewing.value) {
        await refreshSVG();
      }
    });

    return {
      svg,
      refreshSVG,
      codeEditor,
      previewing,
    };
  },
});
</script>
