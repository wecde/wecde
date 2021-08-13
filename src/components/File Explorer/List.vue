<template>
  <FileExplorer-ListItem
    v-for="(item, index) in filesList"
    :file="item"
    :key="item.fullpath"
    @removed="$emit('remove-children', index)"
    @request:refresh="$emit('request:refresh')"
    :names-exists="filesList.map((item) => basename(item.fullpath))"
  />
</template>

<script lang="ts">
import type { StatItem } from "modules/filesystem";
import { basename } from "path-cross";
import { defineComponent, PropType } from "vue";

import FileExplorerListItem from "./ListItem.vue";

export default defineComponent({
  emits: ["remove-children", "request:refresh"],
  components: {
    FileExplorerListItem,
  },
  props: {
    filesList: {
      type: Array as PropType<StatItem[]>,
      required: true,
    },
  },
  setup() {
    return {
      basename,
    };
  },
});
</script>
