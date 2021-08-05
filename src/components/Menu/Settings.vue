<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("Settings") }}</template>

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
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiClose,
} from "@quasar/extras/mdi-v5";
import { defineComponent } from "vue";

import TemplateTab from "./template/Tab.vue";

export default defineComponent({
  components: {
    TemplateTab,
  },
  setup() {
    return {
      mdiChevronDown,
      mdiChevronRight,
      mdiClose,
    };
  },
});
</script>
