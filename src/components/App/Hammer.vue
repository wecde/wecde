<template>
  <q-header elevated :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']">
    <q-toolbar>
      <q-btn
        flat
        round
        dense
        icon="mdi-menu"
        @click="$store.commit(`system/setNavigation`, true)"
        v-if="showHammer"
      />
      <slot />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    showHammer: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
});
</script>
