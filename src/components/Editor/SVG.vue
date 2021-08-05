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
    class="full-width full-height px-6 pb-6 flex items-center justify-center"
    v-if="previewing"
    v-html="svg"
  />
</template>

<script lang="ts">
import { readFile } from "src/modules/filesystem";
import { rawText } from "src/utils";
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
      svg.value = rawText(await readFile(fullpath.value));
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
