<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :persistent="loading"
    @update:model-value="$emit('update:model-value', $event)"
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

        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message"
          maxlength="80"
          class="q-mb-2"
          :disable="amend && noEdit"
          v-model.trim="commitMessage"
        />

        <div class="flex items-center justify-space-between">
          <q-toggle
            v-model="amend"
            color="blue"
            label="Commit amend (git commit --amend)"
            size="sm"
          />

          <q-toggle
            v-model="noEdit"
            :disable="amend === false"
            color="blue"
            label="Commit no edit (flat --no-edit)"
            size="sm"
          />
        </div>

        <div class="q-mt-3">
          <q-checkbox
            left-label
            v-model="isCommitAll"
            label="Commit All"
            size="xs"
          />
        </div>
      </q-card-section>

      <q-card-section class="fill scroll q-mt-n4 q-pt-0">
        <div class="q-ml-n4">
          <Changes-List
            v-if="$store.state['git-configs'].viewAs === 'list'"
            :filter="filterChanges"
          />
          <Changes-Tree v-else :filter="filterChanges" />
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
import ChangesList from "components/Git/ChangesList.vue";
import ChangesTree from "components/Git/ChangesTree.vue";
import { useGitShared } from "src/shared/useGitShared";
import { useStore } from "src/store";
import { ref } from "vue";

const emit = defineEmits<{
  (e: "update:model-value", v: boolean): ($event: boolean) => void;
}>();

const store = useStore();

const { add: _add, commit: _commit } = useGitShared();

const amend = ref<boolean>(false);
const noEdit = ref<boolean>(true);
const commitMessage = ref<string>("");
const isCommitAll = ref<boolean>(true);
const loading = ref<boolean>(false);

function filterChanges(
  filepath: string,
  matrix: [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]
): boolean {
  return isCommitAll.value || matrix[2] === 2;
}

async function commit(): Promise<void> {
  if (loading.value === false) {
    loading.value = true;

    if (isCommitAll.value) {
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
