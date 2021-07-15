<template>
  <div class="fill-width fill-height">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> {{ $t("Find") }} </span>
      </div>

      <div>
        <v-btn
          icon
          :color="modeRegexp ? `blue` : undefined"
          @click="modeRegexp = !modeRegexp"
        >
          <v-icon>mdi-regex</v-icon>
        </v-btn>
        <v-btn
          icon
          :color="modeLetterCase ? `blue` : undefined"
          @click="modeLetterCase = !modeLetterCase"
        >
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn
          icon
          :color="modeWordBox ? `blue` : undefined"
          @click="modeWordBox = !modeWordBox"
        >
          <v-icon>mdi-file-word-box-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="px-3 pt-3 overflow-y-scroll">
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-icon size="20px" @click="openReplace = !openReplace">
            mdi-chevron-right
          </v-icon>
        </div>
        <div class="fill-width">
          <v-text-field
            placeholder="Search"
            outline
            rounded
            class="py-1 grey-4 mx-0"
            hide-details
          />
          <div class="d-flex mt-2" v-if="openReplace">
            <v-text-field
              placeholder="Replace"
              outline
              rounded
              class="py-1 grey-4 mx-0"
              hide-details
            />
            <v-icon class="ml-1" size="16px">mdi-check-all</v-icon>
          </div>
        </div>
      </div>
      <div class="text-right">
        <v-icon @click="openRules = !openRules">mdi-dots-horizontal</v-icon>
        <div class="text-left" v-if="openRules">
          <div>
            <small class="text-caption text--secondary">files to include</small>
            <v-text-field
              outline
              rounded
              class="py-1 grey-4 mx-0"
              hide-details
            />
          </div>
          <div class="mt-2">
            <small class="text-caption text--secondary">files to exclude</small>
            <v-text-field
              outline
              rounded
              class="py-1 grey-4 mx-0"
              hide-details
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  setup() {
    return {
      modeRegexp: ref<boolean>(false),
      modeLetterCase: ref<boolean>(false),
      modeWordBox: ref<boolean>(false),

      openReplace: ref<boolean>(false),
      openRules: ref<boolean>(false),
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
