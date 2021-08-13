<template>
  <Dialog-Top
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card>
      <q-card-section class="q-pa-3">
        Commit
        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message commit on branch now"
          class="q-mt-1"
          maxlength="80"
          autofocus
          @keypress.enter.prevent.stop="$emit('enter', $event)"
        />
        <span class="text-caption"
          >Please provide a commit messsage (Press 'Enter' to confirm or
          'Escape' to cancel)</span
        >
      </q-card-section>
    </q-card>
  </Dialog-Top>
</template>

<script lang="ts">
import DialogTop from "components/DialogTop.vue";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["update:model-value", "enter"],
  components: {
    DialogTop,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
