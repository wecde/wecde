<template>
  <v-app>
    <app-navigation-drawer />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import AppNavigationDrawer from "@/components/AppNavigationDrawer";

export default {
  components: {
    AppNavigationDrawer,
  },
};
</script>

<style lang="scss">
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(231, 231, 231, 0.1);
  transition: background-color .33s cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(231, 231, 231, 0.3);
}
// * {
//   // scrollbar-width: none;
// }
</style>
