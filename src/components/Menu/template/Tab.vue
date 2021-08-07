<template>
  <div class="tab--taskbar grey-2">
    <span class="tab--taskbar--title text-truncate"><slot name="title" /></span>

    <div style="white-space: nowrap" v-if="$slots.addons">
      <slot name="addons" />
    </div>
  </div>

  <slot name="contents" />

  <slot name="others" />
</template>

<style lang="scss" scoped>
.tab {
  &--taskbar {
    height: 38px;
    line-height: 38px;
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
