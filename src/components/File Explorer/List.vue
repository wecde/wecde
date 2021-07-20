<template>
  <div>
    <FileExplorer-ListItem
      v-for="(item, index) in filesList"
      :file="item"
      :key="index"
      @removed="$emit(`removed-file`, index)"
      @refresh-parent="$emit(`refresh`)"
      :names-exists="filesList.map((item) => basename(item.fullpath))"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";
import FileExplorerListItem from "./ListItem.vue";
import type { ReaddirStatItem } from "@/modules/filesystem";
import { basename } from "path";

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
  methods: {
    basename,
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
