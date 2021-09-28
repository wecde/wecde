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

    <font v-if="isFont(fullpath)">
      ABCDEFGHIJKLM<br />
      NOPQRSTUVWXYZ<br />
      abcdefghijklm<br />
      nopqrstuvwxyz<br />
      1 2 3 4 5 6 7 8 9 0
      <component :is="`style`">
        @font-face { font-family: "Font Preview"; font-display: block; src:
        url(data:font/truetype;charset=utf-8;base64,{{ base64 }})
        format("truetype"); font-weight: normal; font-style: normal; }
      </component>
    </font>
  </div>
</template>

<script lang="ts" setup>
import fs from "modules/fs";
import { basename, extname } from "path-cross";
import { isAudio, isFont, isImage, isVideo } from "src/helpers/is-file-type";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  fullpath: string;
}>();

const base64 = ref<string | null>(null);
const ext = computed<string>(() => extname(props.fullpath).replace(/^\./, ""));

watch(
  () => props.fullpath,
  async (newValue) => {
    try {
      base64.value = await fs.readFile(newValue, "base64");
    } catch {
      base64.value = null;
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
img,
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
