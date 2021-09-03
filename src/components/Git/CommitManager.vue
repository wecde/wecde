<template>
  <Dialog-Top
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">Commit</div>
        <q-space />
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-4 q-pb-3">
        <q-toggle
          v-model="amend"
          color="pink"
          label="Commit Amend (git commit --amend --no-edit)"
          keep-color
        />

        <label>Commit What?</label>
        <q-option-group
          v-model="commitWhat"
          :options="commitWhatOptions"
          color="primary"
          inline
        />

        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message"
          maxlength="80"
          class="q-mt-2"
          :disabled="amend"
          v-model.trim="commitMessage"
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

<script lang="ts" setup>
import DialogTop from "components/DialogTop.vue";
import { ref } from "vue";

defineProps<{
  modelValue: boolean;
}>();
defineEmits<{
  "update:model-value": ($event: boolean) => void;
}>();

const amend = ref<boolean>(false);
const commitMessage = ref<string>("");
const commitWhat = ref<"all" | "staged" | "unstaged">("all");
const commitWhatOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Staged",
    value: "staged",
  },
  {
    label: "Unstaged",
    value: "unstaged",
  },
];
</script>
