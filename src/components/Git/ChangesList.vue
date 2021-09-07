<template>
  <ChangesItem
    v-for="item in listChanges"
    :key="item"
    :filepath="item"
    class="q-pl-0"
  />

  <div class="text-center" v-if="listChanges.length === 0">No changes</div>
</template>

<script lang="ts" setup>
import sortChanges from "src/helpers/sort-changes";
import { StateInterface, useStore } from "src/store";
import { computed } from "vue";

import ChangesItem from "./ChangesItem.vue";

const store = useStore();
const props = defineProps<{
  filter?: (
    filepath: string,
    status: StateInterface["editor"]["git"]["statusMatrix"]["matrix"][""]
  ) => boolean;
}>();

const listChanges = computed<string[]>(() => {
  const list = Object.entries(
    store.state.editor.git.statusMatrix.matrix
  ).filter(
    ([filepath, status]) =>
      status.join("") !== "111" &&
      (props.filter ? props.filter(filepath, status) : true)
  );

  return sortChanges(list, store.state["git-configs"].sortBy);
});
</script>
