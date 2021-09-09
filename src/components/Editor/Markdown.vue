<template>
  <Editor-Code
    :fullpath="fullpath"
    :hide-footer="previewing"
    :style="{
      display: previewing ? 'none' : undefined,
    }"
  />
  <div class="fit content q-px-4 q-py-1" v-if="previewing" v-html="html" />

  <teleport to="[data-id='code.btn-addons']" v-if="isMounted">
    <q-btn
      flat
      round
      padding="xs"
      :icon="previewing ? 'ti-pencil-alt' : 'ti-image'"
      @click="previewing = !previewing"
    />
  </teleport>
</template>

<script lang="ts" setup>
import marked from "marked";
import fs from "modules/fs";
import { registerWatch } from "src/helpers/fs-helper";
import { onMounted, ref, watch } from "vue";

import EditorCode from "./Code.vue";

const isMounted = ref<boolean>(false);
onMounted(() => (isMounted.value = true));

const props = defineProps<{
  fullpath: string;
}>();

const previewing = ref<boolean>(false);
const html = ref<string>("");

async function refreshMarkdown(): Promise<void> {
  html.value = marked(await fs.readFile(props.fullpath, "utf8"));
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
watch(
  () => props.fullpath,
  async () => {
    if (previewing.value) {
      await refreshMarkdown();
    }
  }
);

registerWatch(
  () => props.fullpath,
  () => void refreshMarkdown(),
  {
    mode: "absolute",
    exists: true,
    type: "file",
  }
);
</script>

<style lang="scss" scoped>
.content {
  &:deep(*) {
    all: revert;
    font: {
      family: inherit;
    }

    /* http://meyerweb.com/eric/tools/css/reset/
   v5.0.1 | 20191019
   License: none (public domain)
*/

    html,
    body,
    div,
    span,
    applet,
    object,
    iframe,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    blockquote,
    pre,
    a,
    abbr,
    acronym,
    address,
    big,
    cite,
    code,
    del,
    dfn,
    em,
    img,
    ins,
    kbd,
    q,
    s,
    samp,
    small,
    strike,
    strong,
    sub,
    sup,
    tt,
    var,
    b,
    u,
    i,
    center,
    dl,
    dt,
    dd,
    menu,
    ol,
    ul,
    li,
    fieldset,
    form,
    label,
    legend,
    table,
    caption,
    tbody,
    tfoot,
    thead,
    tr,
    th,
    td,
    article,
    aside,
    canvas,
    details,
    embed,
    figure,
    figcaption,
    footer,
    header,
    hgroup,
    main,
    menu,
    nav,
    output,
    ruby,
    section,
    summary,
    time,
    mark,
    audio,
    video {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article,
    aside,
    details,
    figcaption,
    figure,
    footer,
    header,
    hgroup,
    main,
    menu,
    nav,
    section {
      display: block;
    }
    /* HTML5 hidden-attribute fix for newer browsers */
    *[hidden] {
      display: none;
    }
    body {
      line-height: 1;
    }
    menu,
    ol,
    ul {
      list-style: none;
    }
    blockquote,
    q {
      quotes: none;
    }
    blockquote:before,
    blockquote:after,
    q:before,
    q:after {
      content: "";
      content: none;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
  }
}
</style>
