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
    <q-card class="bg-grey-10 text-white">
      <q-bar>
        <div class="text-weight-medium text-subtitle1">
          {{ $t("Console") }}
        </div>
        <q-space />

        <q-btn
          dense
          flat
          :icon="mdiMinus"
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
          :icon="mdiCropSquare"
          @click="maximized = true"
          :disable="maximized"
        >
          <q-tooltip v-if="!maximized" class="bg-white text-primary"
            >Maximize</q-tooltip
          >
        </q-btn>
        <q-btn dense flat :icon="mdiClose" v-close-popup>
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

<script lang="ts">
import { mdiClose, mdiCropSquare, mdiMinus } from "@quasar/extras/mdi-v5";
import { useQuasar } from "quasar";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import { computed, defineComponent, ref, watch } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const lines = computed<
      {
        color?: string;
        message: string;
      }[]
    >(() => store.state.terminal.lines);
    const $q = useQuasar();
    const terminal = ref<Element | null>(null);

    function onBeforeClose() {
      $q.dialog({
        title: "Are you sure?",
        message:
          "After closing the window you won't see the front log anymore?",
        cancel: true,
      }).onOk(() => {
        // console.log('OK')
        store.commit("terminal/clear");
      });
    }

    watch(
      lines,
      () => {
        if (terminal.value) {
          createTimeoutBy(
            "terminal.index.fix-async-dom-scroll",
            () => {
              terminal.value?.scrollTo(0, terminal.value.scrollHeight);
            },
            70
          );
        }
      },
      {
        deep: true,
      }
    );

    return {
      mdiCropSquare,
      mdiMinus,
      mdiClose,

      terminal,
      lines,
      maximized: ref<boolean>(false),
      onBeforeClose,
    };
  },
});
</script>

<style lang="scss" scoped>
.terminal {
  font-family: monospace, courier, fixed, swiss, sans-serif;
  font-weight: normal;
  font-variant-ligatures: none;
  line-height: normal;
  overflow: hidden scroll;
  white-space: pre-line;
  word-break: break-all;
  font-size: 14px;
  font-weight: normal;

  .header {
    padding: {
      bottom: 10px;
      font-size: 20px;
      font-weight: bold;
    }
  }

  .cursor {
    color: #000000;
    background: #00ff00;
    &.fake {
      display: inline-block;
      width: 0.5em;
      height: 1em;
      margin: 0;
      padding: 0;
      line-height: 1;
      transform: translateY(10%);
    }
  }
}
</style>
