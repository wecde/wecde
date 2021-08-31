<template>
  <App-Collapse :disabled="!isFolder" eager>
    <template v-slot:activator="{ on, state }">
      <div
        class="file-object"
        :class="{
          dark: $q.dark.isActive,

          'star-added':
            status === `020` || status === `022` || status === '02x',
          added: status === `023`,

          'is-folder': isFolder || false,

          'star-modified': status === `121` || status === '12x',
          modified: status === `122` || status === `123`,

          'star-deleted': status === `101` || status === '10x',
          deleted: status === `100`,
        }"
        v-on="on"
        v-bind="$attrs"
        v-ripple
      >
        <q-icon
          size="20px"
          :name="state ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          v-if="isFolder"
        />

        <img
          class="icon-file"
          :src="
            getIcon({
              light: false,
              isOpen: false,
              isFolder: isFolder || false,
              name: basename(filepath),
            })
          "
        />

        <div class="full-width text-truncate">
          {{ basename(filepath) }}
          <small
            class="text-caption"
            style="opacity: 0.8"
            v-if="noFullpath !== true"
            >{{ filepath }}</small
          >
        </div>

        <div
          class="actions flex no-wrap"
          :style="{
            display: $q.platform.is.mobile ? 'flex !important' : undefined,
          }"
        >
          <q-btn
            color="inherit"
            flat
            dense
            icon="mdi-undo"
            padding="none"
            size="12.5px"
            rounded
            @click="reset(filepath, null, isFolder)"
          />
          <q-btn
            color="inherit"
            flat
            dense
            :icon="status[2] === '2' ? 'mdi-minus' : 'mdi-plus'"
            padding="none"
            size="12.5px"
            rounded
            @click="
              status[2] === '2'
                ? void resetIndex(filepath, isFolder)
                : void add(filepath, isFolder)
            "
          />
        </div>
      </div>
    </template>

    <slot name="default" />
  </App-Collapse>
</template>

<script lang="ts" setup>
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import AppCollapse from "components/App/Collapse.vue";
import { basename, join } from "path-cross";
import { add, reset, resetIndex } from "src/shared/git";
import { useStore } from "src/store";
import { computed } from "vue";

const store = useStore();

const props = defineProps<{
  filepath: string;
  isFolder?: boolean;
  noFullpath?: boolean;
}>();
defineEmits<{
  (e: "click:undo"): void;
  (e: "click:add"): void;
}>();

const status = computed<string | null>(() => {
  if (store.state.editor.project) {
    return store.getters["editor/status:filepath"](
      join(store.state.editor.project, props.filepath),
      props.isFolder
    );
  }

  return null;
});
</script>

<style lang="scss" scoped>
@import "src/sass/file-object.scss";
@import "src/sass/git-color.scss";
@import "src/sass/icon-file.scss";

.file-object {
  @include file-object;
  @include git-color;

  padding: {
    // left: 0;
    right: 0;
  }
  &:after {
    right: 5px;
  }

  .actions {
    margin-right: 1.1em;
    display: none;
  }

  &:hover .actions {
    display: flex;
  }
}
.icon-file {
  @include icon-file;
}
</style>
