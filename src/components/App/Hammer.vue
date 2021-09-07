<template>
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
        @click="$store.commit(`system/setNavigation`, true)"
        v-if="!hideNavigation"
      />
      <slot />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
defineProps<{
  hideNavigation?: boolean;
}>();
</script>
