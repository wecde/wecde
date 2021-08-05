<template>
  <div v-html="changelog" class="markdown-preview" />
</template>

<script lang="ts">
import marked from "marked";
import { defineComponent } from "vue";

import changelog from "!raw-loader!src/assets/changelog.md";

export default defineComponent({
  setup() {
    return {
      changelog: marked(changelog),
    };
  },
});
</script>

<style lang="sass" scoped>
.markdown-preview
  all: revert
  :deep(*)
    all: revert
</style>
