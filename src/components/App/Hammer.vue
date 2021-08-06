<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn
        flat
        round
        dense
        :icon="mdiMenu"
        @click="$store.commit(`system/setNavigation`, true)"
        v-if="showHammer"
      />
      <slot />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { mdiMenu } from "@quasar/extras/mdi-v5";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    showHammer: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  setup() {
    return {
      mdiMenu,
    };
  },
});
</script>
