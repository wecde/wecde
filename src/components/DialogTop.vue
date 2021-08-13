<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :persistent="persistent"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <slot name="default" />
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  events: ["update:model-value"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>
