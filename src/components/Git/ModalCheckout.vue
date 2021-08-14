<template>
  <Dialog-Top
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.checkout") }}
        </div>
        <q-space />
        <q-btn
          :label="$t('label.checkout')"
          flat
          color="primary"
          padding="xs"
          class="q-mr-xs"
          :disabled="!branch"
          @click="checkout(branch)"
        />
        <q-btn :icon="mdiClose" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-2 q-pb-3">
        <q-select
          dense
          square
          outlined
          label="Select a ref to checkout"
          class="q-mt-1"
          :options="branches"
          option-label="name"
          option-value="name"
          emit-value
          map-options
          v-model="branch"
          :loading="loading"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No branches </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-list dense class="q-mx-n4 q-mt-1">
          <q-item v-ripple @click="$emit('click:new')">
            <q-item-section side>
              <q-icon :name="mdiPlus" />
            </q-item-section>
            <q-item-section>Create new branch...</q-item-section>
          </q-item>
          <q-item v-ripple @click="$emit('click:new-from')">
            <q-item-section side>
              <q-icon :name="mdiPlus" />
            </q-item-section>
            <q-item-section>Create new branch from...</q-item-section>
          </q-item>
          <q-item v-ripple @click="$emit('click:delete')">
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
import { mdiClose, mdiLightningBolt, mdiPlus } from "@quasar/extras/mdi-v5";
import DialogTop from "components/DialogTop.vue";
import { listBranches } from "components/Menu/Git.helpers";
import { checkout } from "components/Menu/Git.methods";
import type { Branch } from "components/Menu/Git.types";
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  emits: [
    "update:model-value",
    "done",
    "click:new",
    "click:new-from",
    "click:delete",
  ],
  components: {
    DialogTop,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: false,
    },
  },
  setup(props) {
    const loading = ref<boolean>(false);
    const branches = ref<Branch[]>([]);

    watch(
      () => props.modelValue,
      async (state) => {
        if (state) {
          branches.value.splice(0);
          branches.value.push(
            ...(await listBranches()).filter(
              (item) => item.current === false
            )
          );
        } else {
          branches.value.splice(0);
        }
      }
    );

    return {
      mdiLightningBolt,
      mdiPlus,
      mdiClose,

      loading,
      branches,
      branch: ref<string>(""),
    };
  },
  methods: {
    async checkout(branch: string): Promise<void> {
      if (await checkout(branch)) {
        this.$emit("done");
        this.$emit("update:model-value", false);
      }
    },
  },
});
</script>
