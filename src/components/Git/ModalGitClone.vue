<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="state"
    @update:model-value="$emit('update:state', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.clone-repo") }}
        </div>
        <q-space />
        <q-btn :icon="mdiClose" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-2 q-pb-3">
        <span class="text-blue text-weight-medium">{{
          $t("label.set-credentials")
        }}</span>
        {{ $t("label.to-access-private") }}

        <q-input
          dense
          autofocus
          :placeholder="$t('placeholder.git')"
          v-model.trim="url"
          required
          @keypress.enter="cloneRepo"
          class="q-mt-2"
        />
      </q-card-section>

      <q-card-actions align="between">
        <q-btn
          flat
          dense
          color="primary"
          v-close-popup
          :label="$t('label.cancel')"
        />
        <q-btn
          flat
          dense
          color="primary"
          @click="cloneRepo"
          :label="$t('label.ok')"
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

        // eslint-disable-next-line functional/no-let
        let existsProject = false;
        try {
          if ((await stat(`projects/${name}`)).type === "directory") {
            existsProject = true;
          }
        } catch {}

        if (existsProject) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("Project existst");
        }

        await clone({
          dir: `projects/${name}`,
          url: this.url,
          ref: "master",
        });

        void Toast.show({
          text: this.$t("alert.clone-success", {
            url: this.url,
          }),
        });

        this.$emit("cloned");

        this.$store.commit("terminal/clear");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        this.$store.commit("terminal/error", err);
        void Toast.show({
          text: this.$t("alert.clone-failed", {
            url: this.url,
            message: err.message,
          }),
        });
      }

      this.$emit("update:state", false);
    },
  },
});
</script>
