<template>
  <div class="flex items-center justify-center text-center px-3">
    <img
      :src="`data:image/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      v-if="type === `image`"
    />
    <video
      :src="`data:video/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      controls
      v-else-if="type === `video`"
    />
    <audio
      :src="`data:audio/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      controls
      class="fill-width"
      v-else-if="type === `audio`"
    />

    <font v-else-if="type === `font`">
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
    </font>
  </div>
</template>

<script lang="ts">
import { basename } from "path-cross";
import { readFile } from "src/modules/filesystem";
import { extname } from "src/utils";
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    fullpath: {
      type: String,
      required: true,
    },
    type: {
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

<style lang="scss" scoped>
img {
  max-width: 100%;
}

video {
  max-width: 100%;
}

font {
  font-family: "Font Preview";
  font-size: 32px;
  line-height: 36px;
  letter-spacing: 5px;
  padding: 24px;
  word-break: break-all;
}
</style>
