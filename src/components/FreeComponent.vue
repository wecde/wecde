<template>
  <slot
    v-if="state"
    :on="{
      hide: () => (state = false),
    }"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps<{
  active?: boolean;
}>();

const state = ref<boolean>(false);

watch(
  () => props.active,
  (val) => {
    if (val) {
      state.value = true;
    }
  },
  {
    immediate: true,
  }
);
</script>
