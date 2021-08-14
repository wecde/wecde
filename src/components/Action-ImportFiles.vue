<template>
  <slot name="default" :on="() => importFile()" />
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import importFiles from "modules/import-files";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["imported"],
  props: {
    dirname: {
      type: String,
      required: true,
    },
  },
  methods: {
    async importFile(): Promise<void> {
      const names = await importFiles(this.dirname);
      this.$store.commit("terminal/clear");
      void Toast.show({
        text: this.$t("alert.imported-type", {
          type: this.$t("file(s)"),
          list: names.map((item) => `"${item}"`).join(", "),
        }),
      });
      this.$emit("imported");
    },
  },
});
</script>
