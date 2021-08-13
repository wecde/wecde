<template>
  <Editor-Code
    :fullpath="fullpath"
    @change="
      $emit('change');
      previewing && refreshMarkdown();
    "
    :show="!previewing"
    :input-value="!previewing"
    ref="codeEditor"
  />
  <div
    class="full-width full-height"
    v-if="previewing"
    v-html="html"
  />
</template>

<script lang="ts">
import marked from "marked";
import { readFile } from "modules/filesystem";
import { rawText } from "src/utils";
import { defineComponent, ref, toRefs, watch } from "vue";
import type { DefineComponent } from "vue";

import EditorCode from "./Code.vue";

export default defineComponent({
  emits: ["change"],
  name: "Editor-Preview-Markdown",
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
    const html = ref<string>("");
    const codeEditor = ref<DefineComponent | null>(null);

    async function refreshMarkdown(): Promise<void> {
      html.value = marked(rawText(await readFile(fullpath.value)));
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
    watch(fullpath, async () => {
      if (previewing.value) {
        await refreshMarkdown();
      }
    });

    return {
      html,
      refreshMarkdown,
      codeEditor,
      previewing,
    };
  },
});
</script>
