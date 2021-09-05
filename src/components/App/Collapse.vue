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

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    eager: {
      type: Boolean,
      default: false,
    },
    contentClass: {
      type: [Array, Object, String],
      required: false,
    },
  },
  setup(props) {
    const { eager } = toRefs(props);
    const state = ref<boolean>(eager.value);
    const setuped = ref<boolean>(false);

    const watchState = watch(state, (newValue) => {
      if (newValue) {
        setuped.value = true;
        watchState();
      }
    });

    if (eager.value) {
      setuped.value = true;
      watchState();
    }

    return {
      state,
      setuped,
    };
  },
});
</script>
