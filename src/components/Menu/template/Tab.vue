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

<script lang="ts" setup>
defineProps<{
  noFlat?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  contentsClass?: string | any[] | Object;
}>();
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
