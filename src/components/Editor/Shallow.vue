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
@font-face {
  font-family: "Orbitron";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(~assets/fonts/Orbitron.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}

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
