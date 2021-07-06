<template>
  <div>
    <slot
      name="activator"
      :state="state"
      :on="{
        click: () => void (state = !state),
      }"
    />
    <div v-show="state">
      <slot name="default" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  props: {
    eager: {
      type: Boolean,
      default: false,
    },
  },
  setup({ eager }) {
    return {
      state: ref(eager),
    };
  },
});
</script>
