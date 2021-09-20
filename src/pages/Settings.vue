<template>
  <teleport to="[data-id='app.navbar']" v-if="isMounted">
    <q-btn flat round dense icon="mdi-arrow-left" @click="$router.back()" />
    <q-toolbar-title>Settings</q-toolbar-title>
  </teleport>

  <q-list
    :class="{
      'bg-dark': $q.dark.isActive,
    }"
    padding
  >
    <template v-for="(group, index) in groups" :key="group.name">
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
              :placeholder="option.placeholder ?? option.default"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'date'"
              style="min-width: 100px"
              type="date"
              :placeholder="option.placeholder ?? option.default"
              v-model="createRefStore(option.path).value"
            />
            <q-input
              dense
              v-else-if="option.type === 'string'"
              style="max-width: 100px"
              type="text"
              :placeholder="option.placeholder ?? option.default"
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
              :placeholder="option.placeholder ?? option.default"
              map-options
            />
          </template>
        </q-item-section>
      </q-item>

      <q-separator spaced v-if="index < groups.length - 1" />
    </template>
  </q-list>
</template>

<script lang="ts" setup>
import { useIsMounted } from "src/helpers/useIsMounted";
import { useStore } from "src/store";
import { groups } from "src/store/settings/options";
import { computed } from "vue";
import type { ComputedRef } from "vue";

const store = useStore();

const isMounted = useIsMounted();

function createRefStore(path?: string): ComputedRef<unknown> {
  if (!path) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error("Empty path");
  }
  return computed<unknown>({
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
}
</script>
