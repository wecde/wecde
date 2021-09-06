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

        <div class="flex items-center justify-space-between">
          <q-toggle
            v-model="amend"
            color="blue"
            label="Commit amend (git commit --amend)"
          />

          <q-toggle
            v-model="noEdit"
            :disable="amend === false"
            color="blue"
            label="Commit no edit (flat --no-edit)"
          />
        </div>

        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message"
          maxlength="80"
          class="q-mt-2"
          :disable="amend && noEdit"
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
  </q-dialog>
</template>

<script lang="ts" setup>
import { add as _add, commit as _commit } from "src/shared/git-shared";
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
const noEdit = ref<boolean>(true);
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
  if (loading.value === false) {
    loading.value = true;

    if (commitWhat.value === "all") {
      await _add(Object.keys(store.state.editor.git.statusMatrix.matrix));
    }
    await _commit({
      message: commitMessage.value,
      amend: amend.value,
      noEdit: noEdit.value,
    });

    loading.value = false;

    emit("update:model-value", false);
  }
}
</script>
