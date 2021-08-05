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
        <q-tab class="primary--text" :icon="mdiCubeOutline" name="labs" />

        <q-tab
          class="primary--text"
          :icon="mdiAndroidMessages"
          name="changelog"
        />
      </q-tabs>
    </div>

    <q-space />
  </App-Hammer>

  <q-tab-panels v-model="tab" animated keep-alive>
    <q-tab-panel name="labs">
      <Home-Labs />
    </q-tab-panel>
    <q-tab-panel name="changelog">
      <Home-Changelog />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts">
import { mdiAndroidMessages, mdiCubeOutline } from "@quasar/extras/mdi-v5";
import AppHammer from "src/components/App/Hammer.vue";
import HomeChangelog from "src/components/Home/Changelog.vue";
import HomeLabs from "src/components/Home/Labs.vue";
import { defineComponent, ref } from "vue";

export default defineComponent({
  components: {
    AppHammer,
    HomeLabs,
    HomeChangelog,
  },
  setup() {
    return {
      mdiCubeOutline,
      mdiAndroidMessages,

      tab: ref<string>("labs"),
    };
  },
  watch: {
    "$route.query.tab": {
      handler(newValue: string | void) {
        this.tab = newValue ? newValue : "labs";
      },
      immediate: true,
    },
  },
});
</script>
