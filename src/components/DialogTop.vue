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

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
  persistent?: boolean;
}>();
defineEmits<{
  (event: "update:model-value", value: boolean): void;
}>();
</script>
