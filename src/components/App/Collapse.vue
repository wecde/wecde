<template>
  <div>
    <slot
      name="activator"
      :state="state"
      :on="{
        click: () => void (state = !state),
      }"
    />
    <div v-show="state" v-if="setuped">
      <slot name="default" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "@vue/composition-api";

export default defineComponent({
  props: {
    eager: {
      type: Boolean,
      default: false,
    },
  },
  setup({ eager }) {
    const state = ref<boolean>(eager);
    const setuped = ref<boolean>(false);

    const watchState = watch(state, (newValue) => {
      if (newValue) {
        setuped.value = true;
        watchState();
      }
    });

    return {
      state,
      setuped,
    };
  },
});
</script>
