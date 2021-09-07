<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :persistent="loading"
  >
    <q-card class="flex column no-wrap">
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">Tag manager</div>
        <q-space />

        <q-btn icon="mdi-plus" v-ripple flat round dense @click="addTag" />
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="fit scroll q-py-0">
        <q-linear-progress
          indeterminate
          color="blue"
          size="2px"
          rounded
          class="q-mx-n4"
          style="position: absolute; top: 0"
          v-if="loading"
        />

        <q-list padding class="q-mx-n4" v-if="tags.length > 0">
          <q-item
            clickable
            v-ripple
            v-for="tag in tags"
            :key="tag.remote"
            class="no-min-height"
          >
            <q-item-section>
              <q-item-label>
                {{ remote.remote }}
                <small class="text-info"> refs/tags/{{ tag.remote }} </small>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-btn
                color="inherit"
                flat
                dense
                icon="mdi-dots-vertical"
                @click.stop
              >
                <q-menu
                  :class="{
                    'bg-grey-9': $q.dark.isActive,
                  }"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                  anchor="bottom right"
                  self="top right"
                >
                  <q-list>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      class="no-min-height"
                      @click="deleteTag(remote.remote)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-trash" />
                      </q-item-section>
                      <q-item-section>Remove</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="text-center q-py-3" v-else>
          No Remotes. Click + to add aremote.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  deleteTag as _deleteTag,
  listTags as _listTags,
  tag as _tag,
} from "isomorphic-git";
import fs from "modules/fs";
import { useQuasar } from "quasar";
import { useStore } from "src/store";
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const store = useStore();
const $q = useQuasar();

const loading = ref<boolean>(false);

const tags = ref<string[]>([]);

async function listTags() {
  if (store.state.editor.project) {
    return await _listTags({
      fs,
      dir: store.state.editor.project,
    });
  }

  return [];
}

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      tags.value = await listTags();
    } else {
      tags.value = [];
    }
  },
  {
    immediate: true,
  }
);

function addTag() {
  $q.dialog({
    title: "Add tag",
    message: "Tag name:",
    prompt: {
      // dense: true,
      square: true,
      outlined: true,
      maxlength: 20,
      // class: "q-mt-2",
      model: "",
      type: "string", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (name: string) => {
    if (store.state.editor.project) {
      await _tag({
        fs,
        dir: store.state.editor.project,
        ref: name,
      });

      tags.value = await listTags();
    }
  });
}
async function deleteTag(tag: string) {
  if (store.state.editor.project) {
    await _deleteTag({
      fs,
      dir: store.state.editor.project,
      ref: tag,
    });
  }
}
/// fetch, pull
</script>
