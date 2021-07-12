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
import { defineComponent, ref, watch, toRefs } from "@vue/composition-api";

export default defineComponent({
  props: {
    eager: {
      type: Boolean,
      default: false,
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
