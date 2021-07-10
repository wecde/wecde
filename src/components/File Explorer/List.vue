<template>
  <div>
    <FileExplorer-ListItem
      v-for="(item, index) in filesList"
      :file="item"
      :key="index"
      @removed="$emit(`removed-file`, index)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";
import FileExplorerListItem from "./ListItem.vue";
import type { ReaddirStatItem } from "@/modules/filesystem";

export default defineComponent({
  components: {
    FileExplorerListItem,
  },
  props: {
    filesList: {
      type: Array as PropType<ReaddirStatItem[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
