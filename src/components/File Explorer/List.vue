<template>
  <FileExplorer-ListItem
    v-for="item in filesList"
    :file="item"
    :key="item.fullpath"
    :names-exists="filesList.map((item) => basename(item.fullpath))"
  />
</template>

<script lang="ts" setup>
import { basename } from "path-cross";
import type { StatItem } from "src/helpers/fs-helper";

import FileExplorerListItem from "./ListItem.vue";

defineProps<{
  filesList: readonly StatItem[];
}>();
</script>
