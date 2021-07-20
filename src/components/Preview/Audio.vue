<template>
  <div class="d-flex align-center justify-center px-3">
    <audio
      :src="`data:audio/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      controls
      class="fill-width"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  watch,
  toRefs,
  computed,
} from "@vue/composition-api";
import { readFile } from "@/modules/filesystem";
import { extname } from "@/utils";
import { basename } from "path";

export default defineComponent({
  props: {
    fullpath: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { fullpath } = toRefs(props);
    const base64 = ref<string | null>(null);
    const ext = computed<string | null>(() =>
      fullpath.value ? extname(fullpath.value) : null
    );

    watch(
      fullpath,
      async (newValue) => {
        try {
          base64.value = await readFile(newValue);
        } catch {
          base64.value = null;
          console.error(`file ${newValue} not ready`);
        }
      },
      {
        immediate: true,
      }
    );

    return {
      base64,
      ext,
    };
  },
  methods: {
    basename,
  },
});
</script>
