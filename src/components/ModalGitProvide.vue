<template>
  <v-dialog
    transition="dialog-top-transition"
    max-width="600"
    top
    content-class="dialog--git-provide"
  >
    <template v-slot:activator="{ on, attr }">
      <slot name="activator" :on="on" :attr="attr" />
    </template>

    <template v-slot="dialog">
      <v-card dark>
        <div class="d-flex justify-space-between align-center fill-width">
          <v-card-title class="text-body-1">
            {{ $t("Credentials") }}
          </v-card-title>
          <div>
            <v-btn
              icon
              color="rgb(183, 185, 195)"
              @click="dialog.value = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text>
          <span style="color: #999">{{ $t("Provider") }}</span>
          <select class="select--provide" v-model="provideSelected">
            <option
              v-for="(item, host) in $store.state.settings.git"
              :key="host"
              :value="host"
            >
              {{ providersGIT[host] }}
            </option>
          </select>

          <v-text-field
            :placeholder="$t('Username')"
            hide-details
            v-model="username"
          />
          <v-text-field
            :placeholder="$t('Password')"
            hide-details
            v-model="password"
          />
          <v-text-field
            :placeholder="$t('Email')"
            type="email"
            hide-details
            v-model="email"
          />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn text @click="dialog.value = false"> {{ $t("Cancel") }} </v-btn>
          <v-btn
            text
            @click="
              save();
              dialog.value = false;
            "
          >
            {{ $t("OK") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import { defineComponent, ref, watch } from "@vue/composition-api";
import { providersGIT } from "@/store/modules/settings";
import $store from "@/store";

export default defineComponent({
  setup() {
    const provideSelected = ref("github.com");

    const username = ref("");
    const password = ref("");
    const email = ref("");

    watch(
      provideSelected,
      (provide) => {
        [username.value, password.value] = [
          $store.state.settings.git[provide].username,
          $store.state.settings.git[provide].secure,
        ];
      },
      {
        immediate: true,
      }
    );

    return {
      providersGIT,
      provideSelected,

      username,
      email,
      password,

      save() {
        $store.commit("settings/setState", {
          prop: `git/${provideSelected.value}/username`,
          value: username.value,
        });
        $store.commit("settings/setState", {
          prop: `git/${provideSelected.value}/secure`,
          value: password.value,
        });
        $store.commit("settings/setState", {
          prop: `git/${provideSelected.value}/email`,
          value: email.value,
        });
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.select--provide {
  margin: 0;
  border-radius: 0;
  font: inherit;
  vertical-align: middle;
  outline: 0;
  text-transform: none;
  appearance: none;
  margin-left: 16px !important;
  user-select: none;
  color: #5eaeff;
  background: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2224%22%20height%3D%2212%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3Cpolyline%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%221.0%22%20points%3D%2216%207%2010%2013%204%207%22%20%2F%3E%0A%3C%2Fsvg%3E%0A")
    no-repeat 100% 50%;
  border: none;
  padding: 0px;
}
</style>
<style lang="scss">
.dialog--git-provide {
  align-self: flex-start;
}
</style>
