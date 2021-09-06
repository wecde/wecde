<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.credentials") }}
        </div>
        <q-space />
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-2 q-pb-3">
        <div class="flex no-wrap items-center">
          <span class="text-weight-medium">{{ $t("label.provider") }}</span>

          <q-select
            class="q-ml-4"
            v-model="hostEditing"
            :options="
              Object.entries(hosts).map((item) => ({
                label: item[1],
                value: item[0],
              }))
            "
            outline
            dense
            flat
            map-options
            emit-value
          />
        </div>

        <div>
          <q-input
            :placeholder="$t('placeholder.username')"
            dense
            v-model.trim="username"
          />
          <q-input
            :placeholder="$t('placeholder.password')"
            dense
            v-model="password"
          />
          <q-input
            :placeholder="$t('placeholder.mail')"
            dense
            v-model.trim="email"
          />
          <q-input
            :placeholder="$t('placeholder.name')"
            dense
            v-model.trim="name"
          />
        </div>

        <div class="text-caption q-mt-4 text-yellow">
          Support for password authentication was removed on August 13, 2021.
          Please use a personal access token instead. Please see
          <a
            href="https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations"
            target="blank"
            class="text-blue"
            >https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations</a
          >
          for more information. See
          <a
            href="https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens"
            target="blank"
            class="text-blue"
            >token login method</a
          >
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          dense
          color="primary"
          :label="$t('label.cancel')"
          v-close-popup
        />
        <q-btn
          flat
          dense
          color="primary"
          :label="$t('label.ok')"
          v-close-popup
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import type { HostType } from "src/store/git-configs/state";
import { hosts } from "src/store/git-configs/state";
import { ref, watch } from "vue";

defineProps<{
  modelValue: boolean;
}>();
defineEmits<{
  (ev: "update:model-value", v: boolean): void;
}>();

const hostEditing = ref<HostType>("github.com");
const store = useStore();

const username = ref<string>("");
const password = ref<string>("");
const email = ref<string>("");
const name = ref<string>("");

watch(
  hostEditing,
  (host) => {
    username.value = store.getters["git-configs/getConfig"](host, "username");
    password.value = store.getters["git-configs/getConfig"](host, "password");
    email.value = store.getters["git-configs/getConfig"](host, "email");
    name.value = store.getters["git-configs/getConfig"](host, "name");
  },
  {
    immediate: true,
  }
);

function save(): void {
  store.commit("git-configs/setConfig", {
    host: hostEditing.value,
    prop: "username",
    value: username.value,
  });
  store.commit("git-configs/setConfig", {
    host: hostEditing.value,
    prop: "password",
    value: password.value,
  });
  store.commit("git-configs/setConfig", {
    host: hostEditing.value,
    prop: "email",
    value: email.value,
  });
  store.commit("git-configs/setConfig", {
    host: hostEditing.value,
    prop: "name",
    value: name.value,
  });
}
</script>
