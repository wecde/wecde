<template>
  <div class="tab--taskbar bg-grey-9 q-px-4">
    <span class="tab--taskbar--title text-truncate"><slot name="title" /></span>

    <div style="white-space: nowrap" v-if="$slots.addons">
      <slot name="addons" />
    </div>
  </div>

  <div
    class="full-height scroll"
    :class="[
      {
        'q-px-4': noFlat,
      },
      contentsClass,
    ]"
    v-if="$slots.contents"
  >
    <slot name="contents" />
  </div>

  <slot name="default" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    noFlat: {
      type: Boolean,
      default: false,
      required: false,
    },
    contentsClass: {
      type: [String, Object, Array],
      required: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.tab {
  &--taskbar {
    height: 35px;
    line-height: 35px;
    width: 100%;
    display: flex;
    justify-content: space-between;

    &--title {
      font-weight: 600;
      font-size: 14.667px;
      display: block;
    }
  }
}
</style>
