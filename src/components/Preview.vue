<template>
  <div class="flex items-center justify-center text-center">
    <img
      :src="`data:image/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      v-if="isImage(fullpath)"
    />
    <video
      :src="`data:video/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      controls
      v-if="isVideo(fullpath)"
    />
    <audio
      :src="`data:audio/${ext};base64,${base64}`"
      :alt="basename(fullpath)"
      controls
      class="fill-width"
      v-if="isAudio(fullpath)"
    />

    <font 
      v-if="isFont(fullpath)">
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
import fs from "modules/fs";
import { basename, extname } from "path-cross";
import {isAudio, isFont, isImage, isVideo } from "src/helpers/is-file-type"
import { computed, defineComponent, ref, toRefs, watch } from "vue";


export default defineComponent({
  props: {
    fullpath: {
      type: String,
      required: true,
    },
    mime: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { fullpath } = toRefs(props);
    const base64 = ref<string | null>(null);
    const ext = computed<string | null>(() =>
      fullpath.value ? extname(fullpath.value).replace(/^\./, "") : null
    );

    watch(
      fullpath,
      async (newValue) => {
        try {
          base64.value = await fs.readFile(newValue, "base64");
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

      isAudio,
      isFont,
      isImage,
      isVideo,
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
