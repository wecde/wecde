<template>
  <q-layout view="lHh Lpr lFf">
    <App-NavigationDrawer />

    <q-header
      elevated
      :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark']"
    >
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="mdi-menu"
          @click="$store.commit(`system/set:navigation`, true)"
          v-if="!$route.meta.hideNavigation"
        />
        
        <div data-id="app.navbar" class="flex no-wrap full-width justify-between items-center" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <Terminal />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import AppNavigationDrawer from "components/NavigationDrawer.vue";
import Terminal from "components/Terminal.vue";
</script>
