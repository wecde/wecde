<template>
  <Dialog-Top
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :persistent="loading"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">Commit</div>
        <q-space />
        <q-btn
          icon="mdi-close"
          v-ripple
          flat
          round
          dense
          v-close-popup
          :disable="loading"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-4 q-pb-3">
        <q-linear-progress
          indeterminate
          color="blue"
          size="2px"
          rounded
          class="q-mx-n4"
          style="position: absolute; top: 0"
          v-if="loading"
        />

        <q-toggle
          v-model="amend"
          color="blue"
          label="Commit Amend (git commit --amend)"
        />

        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message"
          maxlength="80"
          class="q-mt-2"
          :disable="amend"
          v-model.trim="commitMessage"
        />

        <div class="q-mt-3">
          <label>Commit What?</label>
          <q-option-group
            v-model="commitWhat"
            :options="commitWhatOptions"
            color="blue"
            inline
          />
        </div>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn
          flat
          dense
          color="primary"
          v-close-popup
          :label="$t('label.cancel')"
          :disable="loading"
        />
        <q-btn
          flat
          dense
          color="primary"
          :label="$t('label.ok')"
          :disable="loading"
          @click="commit"
        />
      </q-card-actions>
    </q-card>
  </Dialog-Top>
</template>

<script lang="ts" setup>
import DialogTop from "components/DialogTop.vue";
import {
  commit as _commit,
  commitAll as _commitAll,
} from "src/shared/git-shared";
import { useStore } from "src/store";
import { ref } from "vue";

defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: "update:model-value", v: boolean): ($event: boolean) => void;
}>();

const store = useStore();

const amend = ref<boolean>(false);
const commitMessage = ref<string>("");
const commitWhat = ref<"all" | "staged">("all");
const loading = ref<boolean>(false);
const commitWhatOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Staged",
    value: "staged",
  },
];

async function commit(): Promise<void> {
  loading.value = true;

  if (commitWhat.value === "all") {
    await _commitAll(commitMessage.value);
  } else {
    await _commit(commitMessage.value);
  }

  await store.dispatch("editor/update:matrix-of-filepath");
  loading.value = false;

  emit("update:model-value", false);
}
</script>
