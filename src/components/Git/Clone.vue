<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.clone-repo") }}
        </div>
        <q-space />
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
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

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import fs from "modules/fs";
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
import { useGitCloneWorker } from "src/worker/git-clone";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const i18n = useI18n();

const emit = defineEmits<{
  (ev: "update:model-value", v: boolean): void;
}>();

const url = ref<string>("");

async function cloneRepo() {
  try {
    const name = /([^/]+)(?:\.git)?$/.exec(url.value)?.[1] || "";

    if ((await fs.exists("projects")) === false) {
      await fs.mkdir("projects", {
        recursive: true,
      });
    }

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
      i18n.t("alert.cloneing", {
        url: url.value,
      })
    );
    await useGitCloneWorker()({
      dir: `projects/${name}`,
      url: url.value,
      fs,
      ref: "master",
      ...gitConfigs,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      onProgress,
      onMessage,
    });
    onDone();

    void Toast.show({
      text: i18n.t("alert.clone-success", {
        url: url.value,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    onError(err);
    void Toast.show({
      text: i18n.t("alert.clone-failed", {
        url: url.value,
        message: err.message,
      }),
    });
  }

  emit("update:model-value", false);
}
</script>
