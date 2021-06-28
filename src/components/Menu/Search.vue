<template>
  <div class="fill-width">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> Find </span>
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

    <div class="mx-3 pt-3">
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-icon size="20px"> mdi-chevron-right </v-icon>
        </div>
        <div>
          <app-field class="mx-0" />
          <!-- <app-field class="mx-0 mt-3" /> -->
        </div>
      </div>
      <div class="text-right">
        <v-btn icon>
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>

        <!-- <app-field class="mx-0" />
        <app-field class="mx-0 mt-3" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import AppField from "@/components/AppField";

export default {
  components: {
    AppField,
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
