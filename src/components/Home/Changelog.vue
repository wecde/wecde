<template>
  <div v-html="changelog" class="markdown-preview" />
</template>

<script lang="ts" setup>
import marked from "marked";

import rawChangelog from "!raw-loader!assets/changelog.md";

const changelog = marked(rawChangelog);
</script>

<style lang="sass" scoped>
.markdown-preview
  all: revert
  :deep(*)
    all: revert
</style>
