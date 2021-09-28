<template>
  <div class="image-shallow">
    <img class="q-mt-n9 q-px-n6" :src="require('assets/favicon.svg')" />
    <div class="app--name">Wecde</div>
  </div>
</template>

<script type="ts">
import { defineComponent } from "vue"

export default defineComponent({})
</script>

<style lang="scss" scoped>
@import "scss/font-Orbitron.scss";

.app--name {
  font-family: Orbitron;
  font-size: 1.35rem;
  letter-spacing: 3px;
}

.image-shallow {
  position: relative;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  text-align: center;

  img {
    filter: grayscale(100%);
    max-width: 230px;
  }
}
</style>
