<template>
  <div><slot name="default" :on="{ click: importFile }" /></div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import importFiles from "@/modules/import-files";
import { Toast } from "@capacitor/toast";

export default defineComponent({
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
      Toast.show({
        text: this.$t(`Imported {type} {list}`, {
          type: this.$t("file(s)"),
          list: names.map((item) => `"${item}"`).join(", "),
        }) as string,
      });
      this.$emit("imported");
    },
  },
});
</script>
