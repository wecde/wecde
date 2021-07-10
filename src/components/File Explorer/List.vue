<template>
  <div>
    <app-file-system-item
      v-for="(item, index) in filesList"
      :file="item"
      :key="index"
      @removed="$emit(`removed-file`, index)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";
import AppFileSystemItem from "./ListItem.vue";
import { ReaddirStatItem } from "@/modules/filesystem";

export default defineComponent({
  components: {
    AppFileSystemItem,
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
