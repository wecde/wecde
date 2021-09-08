<template>
  <div
    class="session-item"
    :class="{
      active: index === $store.state.editor.session,

      'star-added': status === `020` || status === `022` || status === '02x',
      added: status === `023`,

      'star-modified': status === `121` || status === '12x',
      modified: status === `122` || status === `123`,

      'star-deleted': status === `101` || status === '10x',
      deleted: status === `100`,
    }"
    v-ripple
    @click="$store.commit(`editor/changeSession`, index)"
  >
    <img
      :src="
        getIcon({
          light: false,
          isOpen: false,
          isFolder: false,
          name: basename(fullpath),
        })
      "
    />
    {{ basename(fullpath) }}
    <!-- <template v-if="isPlainText(item) === false">(read only)</template> -->
    <q-icon
      class="times"
      name="mdi-close"
      @click.prevent.stop="$store.commit(`editor/removeSession`, index)"
    />
  </div>
</template>

<script lang="ts" setup>
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import { basename } from "path-cross";
import { registerWatch } from "src/helpers/fs";
import { useStore } from "src/store";
import { computed } from "vue";

const store = useStore();
const props = defineProps<{
  fullpath: string;
  index: number;
}>();
const emit = defineEmits<{
  (ev: "goto-me"): void
}>()

const status = computed<string | null>(() => {
  return store.getters["editor/status:filepath"](props.fullpath, false);
});

registerWatch(() => props.fullpath, () => void emit("goto-me"), {
  type: "file",
  mode: "absolute"
})
</script>

<style lang="scss" scoped>
@import "src/sass/git-color.scss";

.session-item {
  @include git-color;

  &:after {
    display: none;
  }

  padding: 7px 7px 7px 9px;
  height: 100%;
  cursor: pointer;

  // background-color: rgba($color: #2c2c2c, $alpha: 1);
  transition: background-color 0.22s cubic-bezier(0.215, 0.61, 0.355, 1);
  white-space: nowrap;
  &:hover {
    background-color: rgba($color: #383838, $alpha: 0.3);
    opacity: 1;
    .times {
      opacity: 1;
    }
  }
  &.active {
    opacity: 1;
    background-color: #383838;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: rgba(0, 132, 255, 0.645);
    }
    .times {
      opacity: 1;
    }
  }
  position: relative;
  margin-right: 0;
  display: flex;
  align-items: center;
  img {
    display: inline-block;
    width: 1.3em;
    height: 1.3em;
    margin-right: 3px;
  }
  // &:first-child {
  //   margin-right: 0;
  // }
  // opacity: .8;
  .times {
    margin-left: 3px;
    margin-top: 3px;
    // opacity: 0.3;
  }
}
</style>
