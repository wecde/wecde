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
        <v-btn icon>
          <v-icon>mdi-regex</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-file-word-box-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="mx-3 pt-3 overflow-y-scroll">
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-icon size="20px"> mdi-chevron-right </v-icon>
        </div>
        <div>
          <v-text-field
            placeholder="Search"
            outline
            rounded
            class="py-1 grey-4 mx-0"
            hide-details
            close-on-click
            append-icon="mdi-close"
          />
          <div class="d-flex">
            <v-text-field
              placeholder="Search"
              outline
              rounded
              class="py-1 grey-4 mx-0"
              hide-details
              close-on-click
              append-icon="mdi-close"
            />
            <v-icon>mdi-check-all</v-icon>
          </div>
        </div>
      </div>
      <div class="text-right">
        <v-btn icon>
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>
        files to include
        <v-text-field
          placeholder="Search"
          outline
          rounded
          class="py-1 grey-4 mx-0"
          hide-details
          close-on-click
          append-icon="mdi-close"
        />
        files to exclude
        <v-text-field
          placeholder="Search"
          outline
          rounded
          class="py-1 grey-4 mx-0"
          hide-details
          close-on-click
          append-icon="mdi-close"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
