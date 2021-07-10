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
          <!-- <v-tabs-slider class="tab-slider"></v-tabs-slider> -->
          <v-tab class="primary--text">
            <v-icon>mdi-gitlab</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>mdi-book-outline</v-icon>
          </v-tab>

          <v-tab class="primary--text">
            <v-icon>mdi-android-messages</v-icon>
          </v-tab>
        </v-tabs>
      </div>

      <v-spacer />
      <v-btn icon> </v-btn>
    </App-Hammer>

    <v-tabs-items
      v-model="tab"
      style="height: 100%"
      class="fill-width transparent my-3 mx-4"
    >
      <v-tab-item>
        <ul class="d-flex justify-center align-center flex-wrap mx-n3 pa-0">
          <li
            v-for="item in 4"
            :key="item"
            class="item text-center pa-3 col-6 pt-0"
          >
            <v-card
              color="transparent"
              flat
              max-width="300px"
              class="mx-auto"
              to="/project/shin"
            >
              <v-img src="https://spck.io/templates/lab-learn-snake/tb.nl.png">
                <v-btn
                  icon
                  top
                  color="rgb(211, 212, 212)"
                  style="
                    position: absolute;
                    right: 0;
                    background-color: rgba(34, 34, 34, 0.6);
                  "
                  tile
                  small
                >
                  <v-icon>mdi-bookmark-outline</v-icon>
                  <!-- mdi-bookmark-check-outline -->
                </v-btn>
              </v-img>

              <v-card-text class="ma-0 pa-0">
                <v-card-subtitle
                  class="py-1 text-center font-weight-medium"
                  style="color: rgb(211, 212, 218)"
                >
                  Learn Snake
                  <br />
                  <small class="text-caption font-weight-regular">
                    Match
                  </small>
                </v-card-subtitle>
              </v-card-text>
            </v-card>
          </li>
        </ul>
      </v-tab-item>
      <v-tab-item> {{ $t("No Labs") }} </v-tab-item>
      <v-tab-item v-html="changelog"> </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

import AppHammer from "@/components/App/Hammer.vue";
import marked from "marked";

export default defineComponent({
  components: {
    AppHammer,
  },
  setup() {
    const changelog = ref<string>("");

    fetch("/changelog.md")
      .then((res: Response): Promise<string> => res.text())
      .then((md: string): void => {
        changelog.value = marked(md);
      });

    return {
      tab: ref<number | null>(null),
      changelog,
    };
  },
});
</script>

<style lang="scss" scoped>
.item {
  list-style: none;
}
</style>
