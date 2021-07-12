<template>
  <div class="Editor-SVG">
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
    const svg = ref<string>("");

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
    };
  },
});
</script>
