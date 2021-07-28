<template>
  <div class="mx-n3 pa-0">
    <ul class="d-flex justify-center align-center flex-wrap">
      <li
        v-for="lab in Labs"
        :key="lab.name"
        class="item text-center pa-3 col-6 pt-0"
      >
        <v-card color="transparent" flat max-width="300px" class="mx-auto">
          <v-img
            v-if="lab.images && lab.images.length > 0"
            :src="
              require(`@/assets/labs/${lab['directory-name']}/${lab.images[0]}`)
            "
            :aspect-ratio="177.5 / 142.13"
          >
            <v-btn
              icon
              top
              :color="`rgb(211, 212, 212)`"
              style="
                position: absolute;
                right: 0;
                background-color: rgba(34, 34, 34, 0.6);
              "
              tile
              small
              @click.prevent.stop="$store.commit(`bookmark-labs/toggle`, lab)"
            >
              <v-icon>{{
                $store.state["bookmark-labs"].labs.findIndex(
                  (item) => item.name === lab.name
                ) > -1
                  ? mdiBookmarkCheck
                  : mdiBookmarkOutline
              }}</v-icon>
            </v-btn>
            <template v-slot:placeholder>
              <div class="placeholder-lab">
                <v-icon absolute>{{ mdiLoading }}</v-icon>
              </div>
            </template>
          </v-img>
          <v-img v-else :aspect-ratio="177.5 / 142.13">
            <div class="placeholder-lab">
              <v-icon absolute>{{ mdiLoading }}</v-icon>
            </div>
          </v-img>

          <v-card-text class="ma-0 pa-0">
            <v-card-subtitle
              class="py-1 text-center font-weight-medium"
              style="color: rgb(211, 212, 218)"
            >
              {{ lab.name }}
              <br />
              <small class="text-caption font-weight-regular">
                {{ lab.description }}
              </small>
            </v-card-subtitle>
          </v-card-text>
        </v-card>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import Labs from "@/assets/labs/Release.json";
import { mdiBookmarkCheck, mdiBookmarkOutline, mdiLoading } from "@mdi/js";

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
.item {
  list-style: none;
}

.placeholder-lab {
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
</style>
