<template>
  <q-layout view="lHh Lpr lFf">
    <App-NavigationDrawer />

    <q-page-container>
      <Terminal />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import AppNavigationDrawer from "components/App/NavigationDrawer.vue";
import Terminal from "components/Terminal.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    AppNavigationDrawer,
    Terminal,
  },
});
</script>
