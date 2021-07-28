<template>
  <div class="tab">
    <div class="tab--taskbar grey-2">
      <span class="tab--taskbar--title text-truncate"
        ><slot name="title"
      /></span>

      <div style="white-space: pre-line" v-if="$slots.addons">
        <slot name="addons" />
      </div>
    </div>

    <div class="tab--contents">
      <slot name="contents" />
    </div>

    <slot name="others" />
  </div>
</template>

<style lang="scss" scoped>
.tab {
  height: 100%;
  width: 100%;
  max-width: 100%;

  &--taskbar {
    height: 38px;
    line-height: 38px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: {
      left: 5px;
      right: 5px;
    }

    &--title {
      font-weight: 600;
      font-size: 14.667px;
      display: block;
      margin-left: 12px;
    }
  }
  &--contents {
    overflow-y: scroll;
    padding-bottom: 150px;
    height: 100%;
  }
}
</style>
