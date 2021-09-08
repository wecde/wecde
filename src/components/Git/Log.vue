<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :persistent="loading"
  >
    <q-card class="flex column no-wrap">
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">Log commits</div>
        <q-space />

        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="fit scroll q-py-0">
        <q-linear-progress
          indeterminate
          color="blue"
          size="2px"
          rounded
          class="q-mx-n4"
          style="position: absolute; top: 0"
          v-if="loading"
        />

        <div v-if="logs.length > 0">
          <div class="item q-mb-4">
            <div class="flex no-wrap items-center justify-between">
              <q-chip
                outline
                color="primary"
                text-color="white"
                icon="mdi-source-branch"
                class="q-my-2 q-mr-1"
              >
                master: 9ffac
              </q-chip>

              <q-btn
                color="inherit"
                flat
                dense
                icon="mdi-dots-vertical"
                @click.stop
              />
            </div>

            <div class="flex no-wrap items-center justify-between q-mx-2 meta">
              <span>11:13:18, 8/9/2021</span>
              <span class="text-truncate">Shin Tachibana</span>
            </div>

            <div class="message">(fix) documents error</div>
          </div>
        </div>
        <div class="text-center q-py-3" v-else>No log. Commits show it.</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

defineProps<{
  modelValue: boolean;
}>();
defineEmits<{
  (ev: "update:model-value", v: boolean): void;
}>();

const logs = [1];
const loading = ref<boolean>(false);
</script>

<style lang="scss" scoped>
.item {
  .meta {
    color: #eddaaa;
    font-size: 12px;
    opacity: 0.9;
  }
  .message {
    font-size: 14px;
    padding-left: 24px;
  }
}
</style>
