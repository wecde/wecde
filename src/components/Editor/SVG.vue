<template>
  <div class="Editor-SVG">
    <Editor-Code
      :fullpath="fullpath"
      @change="
        $emit(`change`);
        previewing && refreshSVG();
      "
      class="fill-width fill-height"
      v-show="!previewing"
      :input-value="!previewing"
      ref="codeEditor"
    />
    <div
      class="
        fill-width fill-height
        px-6
        pb-6
        d-flex
        align-center
        justify-center
      "
      v-if="previewing"
      v-html="svg"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "@vue/composition-api";
import EditorCode from "./Code.vue";
import { readFile } from "@/modules/filesystem";
import { rawText } from "@/utils";
import Vue from "vue";

export default defineComponent({
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
    const codeEditor = ref<Vue | null>(null);

    async function refreshSVG() {
      svg.value = rawText(await readFile(fullpath.value));
    }

    watch(
      previewing,
      (newValue) => {
        if (newValue) {
          refreshSVG();
        }
      },
      {
        immediate: true,
      }
    );
    watch(fullpath, () => {
      if (previewing.value) {
        refreshSVG();
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
