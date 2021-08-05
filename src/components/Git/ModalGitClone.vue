<template>
  <q-dialog
    style="max-width: 600px"
    class="inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="state"
    @update:model-value="$emit('update:state', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("Clone Repo") }}
        </div>
        <q-space />
        <q-btn :icon="mdiClose" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-2 q-pb-3">
        <span class="text-blue text-weight-medium">{{
          $t("Set Credentials")
        }}</span>
        {{ $t("to access Private Repository") }}

        <q-input
          dense
          autofocus
          :placeholder="$t('URL (Start with https://)')"
          v-model.trim="url"
          required
          @keypress.enter="cloneRepo"
          class="q-mt-2"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat dense color="primary" v-close-popup :label="$t('Cancel')" />
        <q-btn
          flat
          dense
          color="primary"
          @click="cloneRepo"
          :label="$t('OK')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import { mdiClose } from "@quasar/extras/mdi-v5";
import { stat } from "src/modules/filesystem";
import { clone } from "src/modules/git";
import { defineComponent, ref, watch } from "vue";

// import $store from "src/store";

export default defineComponent({
  emits: ["update:state", "cloned"],
  props: {
    state: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const url = ref<string>("");

    watch(
      () => props.state,
      (newValue) => {
        if (newValue === true) {
          url.value = "";
        }
      }
    );

    return {
      mdiClose,
      url,
    };
  },
  methods: {
    async cloneRepo() {
      try {
        const name = /([^/]+)(?:\.git)?$/.exec(this.url)?.[1] || "";

        if ((await stat(`projects/${name}`)).type === "directory") {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("Project existst");
        }
        await clone({
          dir: `projects/${name}`,
          url: this.url,
          ref: "master",
        });

        void Toast.show({
          text: this.$rt("Clone repo {url} successfuly", {
            url: this.url,
          }),
        });

        this.$emit("cloned");

        this.$store.commit("terminal/clear");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.$store.commit("terminal/error", err);
        void Toast.show({
          text: this.$rt("Clone repo {url} failed: {message}", {
            url: this.url,
            message: err.messaage,
          }),
        });
      }

      this.$emit("update:state", false);
    },
  },
});
</script>
