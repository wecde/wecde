<template>
  <div class="Editor-Markdown">
    <Editor-Code
      :fullpath="fullpath"
      @change="
        $emit(`change`);
        previewing && refreshMarkdown();
      "
      class="fill-width fill-height"
      v-show="!previewing"
    />
    <div
      class="fill-width fill-height px-6 pb-6"
      v-if="previewing"
      v-html="html"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "@vue/composition-api";
import EditorCode from "./Code.vue";
import { readFile } from "@/modules/filesystem";
import { rawText } from "@/utils";
import marked from "marked";

export default defineComponent({
  components: {
    EditorCode,
  },
  props: {
    fullpath: {
      type: String,
      required: true,
    },
    previewing: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { previewing, fullpath } = toRefs(props);
    const html = ref<string>("");

    async function refreshMarkdown() {
      html.value = marked(rawText(await readFile(fullpath.value)));
    }

    watch(
      previewing,
      (newValue) => {
        if (newValue) {
          refreshMarkdown();
        }
      },
      {
        immediate: true,
      }
    );
    watch(fullpath, () => {
      if (previewing.value) {
        refreshMarkdown();
      }
    });

    return {
      html,
      refreshMarkdown,
    };
  },
});
</script>
