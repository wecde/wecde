<template>
  <Preload v-if="ready === false" @done="ready = true" />
  <router-view v-if="ready" />
</template>

<script lang="ts" setup>
import Preload from "components/Preload.vue";
import { ref } from "vue";

const ready = ref<boolean>(false);
</script>
