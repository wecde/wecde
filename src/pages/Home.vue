<template>
  <App-Hammer>
    <q-space />

    <div class="flex">
      <q-tabs
        fixed-tabs
        background-color="transparent"
        class="tabs"
        v-model="tab"
      >
        <q-tab icon="mdi-cube-outline" name="labs" />

        <q-tab icon="mdi-android-messages" name="changelog" />
      </q-tabs>
    </div>

    <q-space />
  </App-Hammer>

  <q-tab-panels v-model="tab" animated keep-alive class="bg-transparent">
    <q-tab-panel name="labs">
      <Home-Labs />
    </q-tab-panel>
    <q-tab-panel name="changelog">
      <Home-Changelog />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts" setup>
import AppHammer from "components/App/Hammer.vue";
import HomeChangelog from "components/Home/Changelog.vue";
import HomeLabs from "components/Home/Labs.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const tab = ref<string>("labs");
const route = useRoute();

watch(
  () => route.query.tab,
  (newValue) => {
    tab.value = (newValue as string) || "labs";
  },
  {
    immediate: true,
  }
);
</script>
