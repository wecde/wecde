<template>
  <teleport to="[data-id='app.navbar']" v-if="isMounted">
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
  </teleport>

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
import HomeChangelog from "components/Home/Changelog.vue";
import HomeLabs from "components/Home/Labs.vue";
import { useIsMounted } from "src/helpers/useIsMounted";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const tab = ref<string>("labs");
const route = useRoute();

const isMounted = useIsMounted();

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
