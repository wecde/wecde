<template>
  <Dialog-Top
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
  </Dialog-Top>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import { mdiClose } from "@quasar/extras/mdi-v5";
import DialogTop from "components/DialogTop.vue";
import git from "isomorphic-git-cross";
import http from "isomorphic-git-cross/http/web/index.js";
import fs from "modules/filesystem";
import {
  configs as gitConfigs,
  onAuth,
  onAuthFailure,
  onAuthSuccess,
  onDone,
  onError,
  onMessage,
  onProgress,
  onStart,
} from "src/helpers/git";
import { defineComponent, ref, watch } from "vue";

// import $store from "src/store";

export default defineComponent({
  emits: ["update:state", "cloned"],
  components: {
    DialogTop,
  },
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
          if ((await fs.stat(`projects/${name}`)).isDirectory()) {
            existsProject = true;
          }
        } catch {}

        if (existsProject) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error(`Project "${name}" exists`);
        }
        onStart(
          this.$t("alert.cloneing", {
            url: this.url,
          })
        );
        await git.clone({
          fs,
          http,
          onProgress,
          onMessage,
          onAuth,
          onAuthFailure,
          onAuthSuccess,
          dir: `projects/${name}`,
          url: this.url,
          ref: "master",
          ...gitConfigs,
        });
        onDone();

        void Toast.show({
          text: this.$t("alert.clone-success", {
            url: this.url,
          }),
        });

        this.$emit("cloned");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        onError(err);
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
