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
            <v-icon>mdi-cube-outline</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>mdi-android-messages</v-icon>
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

export default defineComponent({
  components: {
    AppHammer,
    HomeLabs,
    HomeChangelog,
  },
  setup() {
    return {
      tab: ref<number | null>(null),
    };
  },
});
</script>
