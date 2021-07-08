<template>
  <v-dialog
    transition="dialog-top-transition"
    max-width="600"
    top
    content-class="dialog--git-provid align-self-start"
  >
    <template v-slot:activator="{ on, attr }">
      <slot name="activator" :on="on" :attr="attr" />
    </template>

    <template v-slot="dialog">
      <v-card dark>
        <div class="fill-width">
          <v-card-title class="text-body-1">
            {{ $t("Clone Repo") }}
          </v-card-title>
        </div>
        <v-card-text>
          <span class="blue--text">Set Credentials</span> to acceess Private
          Repository

          <v-text-field
            :placeholder="$t('URL (Start with https://)')"
            hide-details
            v-model="url"
          />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn text @click="dialog.value = false"> {{ $t("Cancel") }} </v-btn>
          <v-btn text @click="cloneRepo">
            {{ $t("OK") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import { clone } from "@/modules/git";
import { Toast } from "@capacitor/toast";
// import $store from "@/store";

export default defineComponent({
  setup() {
    const url = ref("");

    return {
      url,
    };
  },
  methods: {
    async cloneRepo() {
      try {
        const name = this.url.match(/([^/]+)(?:\.git)?$/)?.[1];

        await clone({
          dir: `projects/${name}`,
          url: this.url,
          ref: "master",
        });

        this.$store.commit("terminal/clear");
        Toast.show({
          text: `Clone repo "${this.url}" successfuly.`,
        });
      } catch (err) {
        this.$store.commit("terminal/error", err);
        Toast.show({
          text: `Clone repo "${this.url}" failed.`,
        });
      }
    },
  },
});
</script>

<style lang="scss">
.dialog--git-provide {
  align-self: flex-start;
}
</style>
