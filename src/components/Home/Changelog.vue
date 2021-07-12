<template>
  <div v-html="changelog" />
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import marked from "marked";
import changelog from "raw-loader!@/assets/changelog.md";

export default defineComponent({
  setup() {
    return {
      changelog: marked(changelog),
    };
  },
});
</script>
