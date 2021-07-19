<template>
  <div class="webview">
    <slot name="fab" :on="{ click: openWebView }" />
    <div class="webview--fullscreen"></div>

    <div class="webview--heads">
      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
        content-class="dialog--webview"
      >
        <template v-slot:activator="{ on }">
          <v-fab-transition>
            <v-btn
              fab
              color="dark"
              dark
              small
              class="webview--heads__btn"
              fixed
              :style="{
                top: `${y}px`,
                left: `${x}px`,
                opacity: hover ? 1 : 0.6,
                'z-index': 5,
              }"
              :class="{
                hovering: hover,
              }"
              v-on="on"
              v-show="value"
              @touchstart="onMouseOver"
              @touchmove="onMouseMove"
              @touchend="onMouseOut"
              ref="btn"
            >
              <v-icon>mdi-web</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <v-card dark class="fill-height">
          <iframe
            width="100%"
            height="100%"
            :src="`http://localhost:${port}`"
            border="0"
          />
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
} from "@vue/composition-api";
import $store from "@/store";
import { Browser } from "@capacitor/browser";
import Vue from "vue";

export default defineComponent({
  props: {
    port: {
      type: String,
      default: "0000",
      required: true,
    },
    value: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  setup() {
    const x = computed<number>({
      get() {
        return $store.state.editor.floatingBrowserX || 0;
      },
      set(value) {
        $store.commit("editor/setFloatingBrowserX", value);
      },
    });
    const y = computed<number>({
      get() {
        return $store.state.editor.floatingBrowserY || 0;
      },
      set(value) {
        $store.commit("editor/setFloatingBrowserY", value);
      },
    });
    const hover = ref<boolean>(false);
    const btn = ref<Vue | null>(null);

    let offsetX = 0,
      offsetY = 0;

    if (x.value == null || y.value == null) {
      // set default offset
      onMounted(() => {
        if (btn.value) {
          x.value =
            innerWidth / 2 - parseFloat(getComputedStyle(btn.value.$el).width);
          y.value =
            innerHeight / 2 -
            parseFloat(getComputedStyle(btn.value.$el).height);
        }
      });
    }

    function onMouseOver(event: any) {
      // event.preventDefault();
      hover.value = true;
      const { changedTouches, touches } = event;
      const target = btn.value?.$el || event.target;

      const { clientX, clientY } = changedTouches?.[0] || touches?.[0] || event;

      // const { offsetWidth, offsetHeight } = target;

      const rect = target.getBoundingClientRect();
      const top = rect.top + target.ownerDocument.defaultView.pageYOffset;
      const left = rect.left + target.ownerDocument.defaultView.pageXOffset;

      [offsetX, offsetY] = [left - clientX, top - clientY];
    }
    function onMouseMove(event: any) {
      event.preventDefault();

      if (hover.value) {
        const { changedTouches, touches } = event;

        const { clientX, clientY } =
          changedTouches?.[0] || touches?.[0] || event;

        x.value = clientX + offsetX;
        y.value = clientY + offsetY;
      }
    }
    function onMouseOut(event: any) {
      // event.preventDefault();

      hover.value = false;
      offsetX = 0;
      offsetY = 0;

      const styles = getComputedStyle(btn.value?.$el || event.target);
      const [xMin, xMax] = [0, innerWidth - parseFloat(styles.width)];
      const [yMin, yMax] = [0, innerHeight - parseFloat(styles.height)];

      x.value = Math.min(Math.max(x.value, xMin), xMax);
      y.value = Math.min(Math.max(y.value, yMin), yMax);

      if (
        x.value > xMin ||
        x.value < xMax ||
        y.value > yMin ||
        y.value < yMax
      ) {
        const [dx1, dx2] = [x.value - xMin, xMax - x.value];
        const [dy1, dy2] = [y.value - yMin, yMax - y.value];

        let dicrection = null;

        if (dx1 < dx2) {
          if (dy1 < dy2) {
            dicrection = 0;
          } else {
            dicrection = 3;
          }
        } else {
          if (dy1 < dy2) {
            dicrection = 1;
          } else {
            dicrection = 2;
          }
        }

        switch (dicrection) {
          case 0:
            if (dx1 < dy1) {
              x.value = xMin;
            } else {
              y.value = yMin;
            }
            break;
          case 1:
            if (dx2 < dy1) {
              x.value = xMax;
            } else {
              y.value = yMin;
            }
            break;
          case 2:
            if (dx2 < dy2) {
              x.value = xMax;
            } else {
              y.value = yMax;
            }
            break;
          case 3:
            if (dx1 < dy2) {
              x.value = xMin;
            } else {
              y.value = yMax;
            }
            break;
        }
      }
    }

    async function openWebView() {
      await Browser.open({
        url: `http://localhost:${$store.state.settings.preview__port}`,
        toolbarColor: "#212121",
        presentationStyle: "popover",
      });
    }

    return {
      x,
      y,
      hover,
      btn,

      onMouseOver,
      onMouseMove,
      onMouseOut,

      openWebView,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
.webview--heads__btn {
  transition: top 0.33s ease, left 0.33s ease, opacity 0.33s ease-in-out;

  &.hovering {
    transition: top 0.1s ease, left 0.1s ease, opacity 0.33s ease-in-out;
  }
}
</style>

<style lang="scss">
.dialog--webview {
  height: 100%;
  overflow: hidden;
}
</style>
