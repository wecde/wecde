<template>
  <div as="ul" class="file--system">
    <app-file-system-item
      tag="li"
      v-for="({ name, isFolder, children, file }, index) in files"
      :key="index"
      :name="name"
      :level="level"
      :is-folder="isFolder"
      :children="children"
      :hidden="isHidden(name)"
      :file="file"
      :list-files="listFiles"
      @reload="$emit(`reload`)"
    />
  </div>
</template>

<script>
import AppFileSystemItem from "./AppFileSystemItem";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    AppFileSystemItem,
  },

  props: {
    level: {
      type: Number,
      default: 0,
      required: true,
    },
    files: {
      type: Array,
      required: true,
    },

    listFiles: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  data() {
    return {
      fileManager: [
        {
          name: "index.js",
          isFolder: false,
        },
      ],
    };
  },
  methods: {
    isHidden(filename) {
      if (filename.startsWith(".")) {
        return true;
      }

      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
