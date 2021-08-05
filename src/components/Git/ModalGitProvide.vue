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
          {{ $t("Credentials") }}
        </div>
        <q-space />
        <q-btn :icon="mdiClose" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-2 q-pb-3">
        <div class="flex no-wrap items-center">
          <span class="text-weight-medium">{{ $t("Provider") }}</span>

          <q-select
            class="q-ml-4"
            v-model="provideSelected"
            :options="
              Object.entries(providersGIT).map((item) => ({
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

        <q-input :placeholder="$t('Username')" dense v-model="username" />
        <q-input :placeholder="$t('Password')" dense v-model="password" />
        <q-input :placeholder="$t('Email')" dense v-model="email" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat dense color="primary" :label="$t('Cancel')" v-close-popup />
        <q-btn
          flat
          dense
          color="primary"
          :label="$t('OK')"
          v-close-popup
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { mdiClose } from "@quasar/extras/mdi-v5";
import { useStore } from "src/store";
import { providersGIT } from "src/store/settings/state";
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  emits: ["update:state"],
  props: {
    state: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const provideSelected = ref("github.com");

    const username = ref<string>("");
    const password = ref<string>("");
    const email = ref<string>("");

    watch(
      provideSelected,
      (provide) => {
        // [username.value, password.value] = [
        //   (store.state.settings["git__" + provide] as GitInfo).username,
        //   (store.state.settings["git__" + provide] as GitInfo).password,
        // ];
        console.log(provide);
      },
      {
        immediate: true,
      }
    );

    return {
      mdiClose,

      providersGIT,
      provideSelected,

      username,
      email,
      password,

      save() {
        store.commit("settings/setState", {
          prop: `git/${provideSelected.value}->username`,
          value: username.value,
        });
        store.commit("settings/setState", {
          prop: `git/${provideSelected.value}->password`,
          value: password.value,
        });
        store.commit("settings/setState", {
          prop: `git/${provideSelected.value}->email`,
          value: email.value,
        });
      },
    };
  },
});
</script>
