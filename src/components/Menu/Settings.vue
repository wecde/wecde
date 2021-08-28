<template>
  <Template-Tab no-flat contents-class="q-mt-3">
    <template v-slot:title>{{ $t("label.settings") }}</template>

    <template v-slot:contents>
      Settings have been moved to a separate tab for customization.

      <q-btn
        class="full-width q-mt-5"
        color="positive"
        dense
        no-caps
        to="/settings"
        >Goto Settings</q-btn
      >
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TemplateTab from "./template/Tab.vue";

export default defineComponent({
  components: {
    TemplateTab,
  },
});
</script>
