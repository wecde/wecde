<template>
  <div>
    <v-dialog
      max-width="600"
      :value="lines.length > 0"
      content-class="dialog--terminal"
      persistent
    >
      <div class="terminal" ref="terminal">
        <div
          v-for="(line, index) in lines"
          :class="[line.color ? `${line.color}--text` : undefined]"
          :key="index"
        >
          {{ line.message }}
        </div>
      </div>
    </v-dialog>
    <div
      class="disable-events"
      v-if="lines.length > 0"
      @click.prevent.stop="() => false"
      @mousedown.prevent.stop="() => false"
    />
  </div>
</template>

<script lang="ts">
import { createTimeoutBy } from "@/utils";
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  computed: {
    lines() {
      return this.$store.state.terminal.lines;
    },
  },
  watch: {
    lines() {
      if (this.$refs.terminal) {
        createTimeoutBy(
          "terminal.index.fix-async-dom-scroll",
          () => {
            (this.$refs.terminal as Element).scrollTo(
              0,
              (this.$refs.terminal as Element).scrollHeight
            );
          },
          70
        );
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.terminal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  padding: 10px 10px;

  font-family: monospace, courier, fixed, swiss, sans-serif;
  font-weight: normal;
  font-variant-ligatures: none;
  color: #f0f0f0;
  background: #000000;
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

.disable-events {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999999999;
}
</style>

<style lang="scss">
.dialog--terminal {
  height: 100%;
  position: relative;
}
</style>
