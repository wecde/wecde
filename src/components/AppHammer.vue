<template>
  <v-app-bar app :color="color" elevation="0" height="50.66px">
    <v-app-bar-nav-icon @click="$store.commit(`system/setNavigation`, true)" />
    <slot />
  </v-app-bar>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "grey-1",
    },
  },
};
</script>
