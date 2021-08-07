<template>
  <div class="row q-ml-n1 justify-center">
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
