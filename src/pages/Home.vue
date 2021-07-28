<template>
  <div>
    <App-Hammer>
      <v-spacer />

      <div class="d-flex">
        <v-tabs
          fixed-tabs
          background-color="transparent"
          class="tabs"
          v-model="tab"
        >
          <v-tab class="primary--text">
            <v-icon>{{ mdiCubeOutline }}</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>{{ mdiAndroidMessages }}</v-icon>
          </v-tab>
        </v-tabs>
      </div>

      <v-spacer />
      <v-btn icon disabled />
    </App-Hammer>

    <v-tabs-items
      v-model="tab"
      style="height: 100%"
      class="fill-width transparent my-3 px-4"
    >
      <v-tab-item>
        <Home-Labs />
      </v-tab-item>
      <v-tab-item>
        <Home-Changelog />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import AppHammer from "@/components/App/Hammer.vue";
import HomeLabs from "@/components/Home/Labs.vue";
import HomeChangelog from "@/components/Home/Changelog.vue";
import { mdiCubeOutline, mdiAndroidMessages } from "@mdi/js";

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

      tab: ref<number | null>(null),
    };
  },
  watch: {
    "$route.query.tab": {
      handler(newValue) {
        this.tab = Number(newValue) ?? null;
      },
      immediate: true,
    },
  },
});
</script>
