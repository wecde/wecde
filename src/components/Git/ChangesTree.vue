<template>
  <template v-for="item in listChanges" :key="item">
    <ChangesItem
      :filepath="join(filepathDir || '', item)"
      :is-folder="item.endsWith('/')"
      no-fullpath
    >
      <div class="q-ml-3" v-if="item.endsWith('/')">
        <ChangesTree
          :filepath-dir="join(filepathDir || '', item)"
          :filter="filter"
        />
      </div>
    </ChangesItem>
  </template>
</template>

<script lang="ts">
// eslint-disable-next-line import/order
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChangesTree",
});
</script>

<script lang="ts" setup>
// eslint-disable-next-line import/order
import { join, relative } from "path-cross";

// eslint-disable-next-line import/order
import { StateInterface, useStore } from "src/store";
import { computed } from "vue";

import ChangesItem from "./ChangesItem.vue";

// eslint-disable-next-line import/order
import sortChanges from "src/helpers/sort-changes";

const store = useStore();

const props = defineProps<{
  filepathDir?: string;
  filter?: (
    filepath: string,
    status: StateInterface["editor"]["git"]["statusMatrix"]["matrix"][""]
  ) => boolean;
}>();

const listChanges = computed<string[]>(() => {
  const list = Object.entries(store.state.editor.git.statusMatrix.matrix)
    .filter(
      ([filepath, status]) =>
        status.join("") !== "111" &&
        filepath.startsWith(props.filepathDir || "") &&
        (props.filter ? props.filter(filepath, status) : true)
    )
    .map(
      ([filepath, matrix]): [
        string,
        StateInterface["editor"]["git"]["statusMatrix"]["matrix"][""]
      ] => {
        filepath = relative(props.filepathDir || "", filepath);

        const splited = filepath.split("/");

        if (splited.length > 1) {
          return [`${splited[0]}/`, matrix];
        }

        return [splited[0], matrix];
      }
    )
    .filter(([filepath], index, array) => {
      return (
        array.slice(index + 1).some((item) => filepath === item[0]) === false
      );
    });

  const dirs: typeof list = [];
  const files: typeof list = [];

  list.forEach((item) => {
    if (item[0].endsWith("/")) {
      // eslint-disable-next-line functional/immutable-data
      dirs.push(item);
    } else {
      // eslint-disable-next-line functional/immutable-data
      files.push(item);
    }
  });

  return [
    ...sortChanges(dirs, store.state["git-configs"].sortBy),
    ...sortChanges(files, store.state["git-configs"].sortBy),
  ];
});
</script>
