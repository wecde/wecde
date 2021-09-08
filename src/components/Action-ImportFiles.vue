<template>
  <slot name="default" :on="() => importFile()" />
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import importFiles from "src/helpers/importFiles";
import { useStore } from "src/store";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  dirname: string;
}>();

const store = useStore();
const i18n = useI18n();

async function importFile(): Promise<void> {
  const names = await importFiles(props.dirname);
  store.commit("terminal/clear");
  void Toast.show({
    text: i18n.t("alert.imported-type", {
      type: i18n.t("file(s)"),
      list: names.map((item) => `"${item}"`).join(", "),
    }),
  });
}
</script>
