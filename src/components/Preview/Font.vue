<template>
  <div class="d-flex align-center justify-center text-center">
    ABCDEFGHIJKLM<br />
    NOPQRSTUVWXYZ<br />
    abcdefghijklm<br />
    nopqrstuvwxyz<br />
    1 2 3 4 5 6 7 8 9 0
    <component v-bind:is="`style`">
      @font-face { font-family: "Font Preview"; font-display: block; src:
      url(data:font/truetype;charset=utf-8;base64,{{ base64 }})
      format("truetype"); font-weight: normal; font-style: normal; }
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, toRefs } from "@vue/composition-api";
import { readFile } from "@/modules/filesystem";

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
    };
  },
});
</script>

<style lang="scss" scoped>
div {
  font-family: "Font Preview";
  font-size: 32px;
  line-height: 36px;
  letter-spacing: 5px;
  padding: 24px;
  word-break: break-all;
}
</style>
