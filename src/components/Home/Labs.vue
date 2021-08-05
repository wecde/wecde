<template>
  <div class="row labs justify-center">
    <div class="col-6 labs__item" v-for="lab in Labs" :key="lab.name">
      <q-card color="transparent" flat max-width="300px" class="mx-auto">
        <q-img
          v-if="lab.images && lab.images.length > 0"
          :src="
            require(`src/assets/labs/${lab['directory-name']}/${lab.images[0]}`)
          "
          :aspect-ratio="177.5 / 142.13"
        >
          <q-btn
            :color="`rgb(211, 212, 212)`"
            class="labs__btn-fav"
            padding="xs"
            @click.prevent.stop="$store.commit(`bookmark-labs/toggle`, lab)"
            :icon="
              $store.state['bookmark-labs'].labs.findIndex(
                (item) => item.name === lab.name
              ) > -1
                ? mdiBookmarkCheck
                : mdiBookmarkOutline
            "
          />
          <template v-slot:placeholder>
            <div class="labs__item-placeholder">
              <q-icon absolute :name="mdiLoading" />
            </div>
          </template>
        </q-img>

        <q-card-section class="q-pt-xs">
          <span class="text-subtitle2">
            {{ lab.name }}
          </span>
          <br />
          <small class="text-caption">
            {{ lab.description }}
          </small>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import {
  mdiBookmarkCheck,
  mdiBookmarkOutline,
  mdiLoading,
} from "@quasar/extras/mdi-v5";
import Labs from "assets/labs/Release.json";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {
      mdiBookmarkCheck,
      mdiBookmarkOutline,
      mdiLoading,

      Labs,
    };
  },
});
</script>

<style lang="scss" scoped>
.labs {
  margin: {
    left: -4px;
    right: -4px;
  }

  &__item {
    padding: {
      left: 4px;
      right: 4px;
    }
    text-align: center;
    &-placeholder {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &__btn-fav {
    position: absolute;
    right: 0;
    background-color: rgba(34, 34, 34, 0.6);
  }
}
</style>
