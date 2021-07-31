<template>
  <v-dialog
    transition="dialog-top-transition"
    max-width="600"
    top
    content-class="dialog--git-provid align-self-start"
    :value="value"
  >
    <template>
      <v-card dark>
        <div class="fill-width">
          <v-card-title class="text-body-1">
            {{ $t("Clone Repo") }}
          </v-card-title>
        </div>
        <v-card-text>
          <span class="blue--text">{{ $t("Set Credentials") }}</span>
          {{ $t("to access Private Repository") }}

          <v-text-field
            :placeholder="$t('URL (Start with https://)')"
            hide-details
            v-model="url"
            required
            @keypress.enter="cloneRepo"
          />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn text @click="$emit(`input`, false)">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn text @click="cloneRepo()">
            {{ $t("OK") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "@vue/composition-api";
import { clone } from "@/modules/git";
import { Toast } from "@capacitor/toast";
// import $store from "@/store";

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const url = ref<string>("");

    watch(
      () => props.value,
      (newValue) => {
        if (newValue === true) {
          url.value = "";
        }
      }
    );

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

        Toast.show({
          text: this.$t(`Clone repo {url} successfuly`, {
            url: this.url,
          }) as string,
        });

        this.$emit("done");

        this.$store.commit("terminal/clear");
      } catch (err) {
        this.$store.commit("terminal/error", err);
        Toast.show({
          text: this.$t(`Clone repo {url} failed`, {
            url: this.url,
          }) as string,
        });
      }

      this.$emit(`input`, false);
    },
  },
});
</script>

<style lang="scss">
.dialog--git-provide {
  align-self: flex-start;
}
</style>
