<template>
  <q-dialog
    :model-value="lines.length > 0"
    @update:model-value="$event ? null : $store.commit('terminal/clear')"
    full-width
    full-height
    :maximized="maximized"
    persistent
    class="max-width-dialog"
  >
    <q-card
      class="bg-grey-10 text-white full-height never-scroll flex column no-wrap"
    >
      <q-bar>
        <div class="text-weight-medium text-subtitle1">
          {{ $t("Console") }}
        </div>
        <q-space />

        <q-btn
          dense
          flat
          icon="mdi-minus"
          @click="maximized = false"
          :disable="!maximized"
        >
          <q-tooltip v-if="maximized" class="bg-white text-primary"
            >Minimize</q-tooltip
          >
        </q-btn>
        <q-btn
          dense
          flat
          icon="mdi-crop-square"
          @click="maximized = true"
          :disable="maximized"
        >
          <q-tooltip v-if="!maximized" class="bg-white text-primary"
            >Maximize</q-tooltip
          >
        </q-btn>
        <q-btn dense flat icon="mdi-close" v-close-popup>
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-separator />

      <q-card-section class="fit scroll q-pt-2 q-pb-3">
        <div class="terminal" ref="terminal">
          <div
            v-for="(line, index) in lines"
            :class="[line.color ? `text-${line.color}` : undefined]"
            :key="index"
          >
            {{ line.message }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import { computed, ref, watch } from "vue";

const store = useStore();
const maximized = ref<boolean>(false);
const lines = computed<
  {
    color?: string;
    message: string;
  }[]
>(() => store.state.terminal.lines);
const terminal = ref<Element | null>(null);

watch(lines, () => {
  if (terminal.value) {
    createTimeoutBy(
      "terminal.index.fix-async-dom-scroll",
      () => terminal.value?.scrollTo(0, terminal.value.scrollHeight),
      70
    );
  }
});
</script>

<style lang="scss" scoped>
.terminal {
  font: {
    family: monospace, courier, fixed, swiss, sans-serif;
    weight: normal;
    variant-ligatures: none;
    size: 14px;
  }
  line-height: normal;
  white-space: pre-line;
  word-break: break-all;
}
</style>
