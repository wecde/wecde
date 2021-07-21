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
      :input-value="!previewing"
      ref="codeEditor"
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
import Vue from "vue";

export default defineComponent({
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
    const codeEditor = ref<Vue | null>(null);

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
      codeEditor,
      previewing,
    };
  },
});
</script>
