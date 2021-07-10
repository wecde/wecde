<template>
  <v-app-bar app color="grey-1" elevation="0" height="50.66px">
    <v-app-bar-nav-icon @click="$store.commit(`system/setNavigation`, true)" />
    <slot />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({});
</script>
