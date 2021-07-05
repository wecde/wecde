<template>
  <v-dialog
    persistent
    max-width="600"
    :value="lines.length > 0"
    content-class="dialog--terminal"
  >
    <template>
      <div class="terminal">
        <div class="header">Console</div>
        <div v-for="(line, index) in lines" :key="index">{{ line }}</div>
      </div>
    </template>
  </v-dialog>
</template>

<script>
export default {
  computed: {
    lines() {
      return this.$store.state.terminal.lines;
    },
  },
};
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
  overflow: hidden;
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

<style lang="scss">
.dialog--terminal {
  height: 100%;
  position: relative;
}
</style>
