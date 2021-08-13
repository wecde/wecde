<template>
  <Dialog-Top :model-value="true">
    <q-card>
      <q-card-section class="q-pa-3">
        Checkout
        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Select a ref to checkout"
          class="q-mt-1"
          maxlength="80"
          autofocus
        />

        <q-list dense>
          <q-item>
            <q-item-section side>
              <q-icon :name="mdiPlus" />
            </q-item-section>
            <q-item-section>Create new branch...</q-item-section>
          </q-item>
          <q-item>
            <q-item-section side>
              <q-icon :name="mdiPlus" />
            </q-item-section>
            <q-item-section>Create new branch from...</q-item-section>
          </q-item>
          <q-item>
            <q-item-section side>
              <q-icon :name="mdiLightningBolt" />
            </q-item-section>
            <q-item-section>Checkout detached...</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </Dialog-Top>
</template>

<script lang="ts">
import DialogTop from "src/components/DialogTop.vue";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["update:model-value"],
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
