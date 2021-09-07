<template>
  <slot
    name="activator"
    :state="state"
    :on="{
      click: () => void (state = !state),
    }"
  />
  <div v-show="state" v-if="setuped && !disabled" :class="contentClass">
    <slot name="default" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps<{
  disabled?: boolean;
  eager?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  contentClass?: string[] | Object | string;
}>();

const state = ref<boolean>(props.eager || false);
const setuped = ref<boolean>(false);

const watchState = watch(state, (newValue) => {
  if (newValue) {
    setuped.value = true;
    watchState();
  }
});

if (props.eager) {
  setuped.value = true;
  watchState();
}
</script>
