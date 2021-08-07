<template>
  <App-Hammer :show-hammer="false">
    <q-btn flat round dense :icon="mdiArrowLeft" @click="$router.back()" />
    <q-toolbar-title>Settings</q-toolbar-title>
  </App-Hammer>

  <q-list
    :class="{
      'bg-dark': $q.dark.isActive,
    }"
    padding
  >
    <template v-for="group in groups" :key="group.name">
      <q-item-label header>{{ group.name }}</q-item-label>

      <q-item
        clickable
        v-ripple
        v-for="option in group.options"
        :key="option.name"
      >
        <q-item-section>
          <q-item-label>{{ option.name }}</q-item-label>
          <q-item-label caption v-if="option.description">
            {{ option.description }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <template v-if="option.list === false">
            <q-toggle
              color="blue"
              v-if="option.type === 'boolean'"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'int'"
              style="max-width: 50px"
              type="tel"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'date'"
              type="date"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'string'"
              style="max-width: 100px"
              type="text"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'tel'"
              style="max-width: 50px"
              type="tel"
              v-model="createRefStore(option.path).value"
            />
          </template>
          <template v-else>
            <q-select
              dense
              style="min-width: 70px; max-width: 120px"
              v-model="createRefStore(option.path).value"
              :options="option.list"
              emit-value
              map-options
            />
          </template>
        </q-item-section>
      </q-item>

      <q-separator spaced />
    </template>
  </q-list>
</template>

<script lang="ts">
import { mdiArrowLeft } from "@quasar/extras/mdi-v5";
import AppHammer from "src/components/App/Hammer.vue";
import { useStore } from "src/store";
import { groups } from "src/store/settings/options";
import type { ValueType } from "src/store/settings/options";
import { computed, defineComponent } from "vue";
import type { ComputedRef } from "vue";

export default defineComponent({
  components: {
    AppHammer,
  },
  setup() {
    const store = useStore();

    return {
      mdiArrowLeft,

      groups,

      createRefStore(path?: string): ComputedRef<ValueType | void> {
        if (!path) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("Empty path");
        }
        return computed<ValueType | void>({
          get() {
            return store.state.settings[path];
          },
          set(value) {
            store.commit("settings/set", {
              path,
              value,
            });
          },
        });
      },
    };
  },
});
</script>
