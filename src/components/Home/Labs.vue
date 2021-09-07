<template>
  <div class="row q-mx-n1 justify-center">
    <div class="col-6 col-sm-3 col-md-2 q-px-1 text-center" v-for="lab in Labs" :key="lab.name">
      <q-card flat max-width="300px" class="mx-auto bg-transparent">
        <q-img
          v-if="lab.images && lab.images.length > 0"
          :src="
            require(`assets/labs/${lab['directory-name']}/${lab.images[0]}`)
          "
          :aspect-ratio="177.5 / 142.13"
        />

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

<script lang="ts" setup>
import Labs from "assets/labs/Release.json";
</script>
