<template>
  <Template-Tab>
    <template v-slot:title>Git</template>

    <template v-slot:addons>
      <v-btn icon>
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>
    </template>
  </Template-Tab>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import TemplateTab from "./template/Tab.vue";
import { mdiPlus } from "@mdi/js";

export default defineComponent({
  components: {
    TemplateTab,
  },
  setup() {
    return {
      mdiPlus,
    };
  },
});
</script>
