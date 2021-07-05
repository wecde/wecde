<template>
  <div class="app--rename" v-if="state">
    <div class="app--rename__backboardd" @click="$refs.input.blur()"></div>
    <input
      type="text"
      value="Test project"
      v-model.lazy.trim="inputValueL"
      v-model.trim="input"
      ref="input"
      @keydown.enter="$refs.input.blur()"
      @blur="$emit(`update:state`, false)"
      autofocus
    />
  </div>
  <span v-else @click="timeClick = Date.now()">{{ value }}</span>
</template>

<script>
let timeout;

export default {
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
    },

    inputValue: {
      type: String,
      required: true,
    },

    listFiles: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      timeClick: 0,

      input: "",
    };
  },
  watch: {
    timeClick(newValue, oldValue) {
      if (newValue - oldValue < 1000) {
        this.$emit("update:state", true);

        this.oldValue = 0;
      }
    },
    state(newValue) {
      if (newValue) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.$refs.input.focus();
        });
      }
    },
    value: {
      handler(newValue) {
        this.input = newValue;
      },
      immediate: true,
    },
    input(newValue) {
      this.$emit("input", newValue);
    },
  },
  computed: {
    inputValueL: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("rename", [this.inputValue, value]);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.app--rename {
  color: currentColor;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;

  &__backboardd {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba($color: #000000, $alpha: 0.5);
    z-index: 100;
  }

  input {
    all: initial;
    position: relative;
    z-index: 101;
    font: inherit;
    font-size: inherit;
    color: currentColor;
    font-weight: inherit;
    background-color: #30393f;
    display: block;
    width: 100%;
  }
}
</style>
