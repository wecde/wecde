<template>
  <q-dialog
    class="max-width-dialog inner-bottom-auto"
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :persistent="loading"
  >
    <q-card class="flex column no-wrap">
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">Remote manager</div>
        <q-space />

        <q-btn icon="mdi-plus" v-ripple flat round dense @click="addRemote" />
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

        <q-list padding class="q-mx-n4" v-if="remotes.length > 0">
          <q-item
            clickable
            v-ripple
            v-for="remote in remotes"
            :key="remote.remote"
            class="no-min-height"
          >
            <q-item-section>
              <q-item-label>
                {{ remote.remote }}
                <small class="text-info">
                  refs/remotes/{{ remote.remote }}
                </small>
              </q-item-label>
              <q-item-label caption>{{ remote.url }}</q-item-label>
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
                      @click="copyURL(remote.url)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-layers" />
                      </q-item-section>
                      <q-item-section>Copy URL</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      class="no-min-height"
                      @click="deleteRemote(remote.remote)"
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
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import {
  addRemote as _addRemote,
  deleteRemote as _deleteRemote,
  listRemotes as _listRemotes,
} from "isomorphic-git";
import fs from "modules/fs";
import { useQuasar } from "quasar";
import { useStore } from "src/store";
import { reactive, ref } from "vue";

const store = useStore();
const $q = useQuasar();

const loading = ref<boolean>(false);

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
const remotes = reactive<ThenArg<ReturnType<typeof _listRemotes>>>([]);

void updateListRemotes();

async function updateListRemotes() {
  if (store.state.editor.project) {
    // eslint-disable-next-line functional/immutable-data
    remotes.splice(0);
    // eslint-disable-next-line functional/immutable-data
    remotes.push(
      ...(await _listRemotes({
        fs,
        dir: store.state.editor.project,
      }))
    );
  } else {
    // eslint-disable-next-line functional/immutable-data
    remotes.splice(0);
  }
}

function addRemote() {
  $q.dialog({
    title: "Add remote",
    message: "URL for remote:",
    prompt: {
      // dense: true,
      square: true,
      outlined: true,
      maxlength: 256,
      // class: "q-mt-2",
      model: "",
      type: "url", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk((url: string) => {
    $q.dialog({
      title: "Add remote",
      message: "Name for remote:",
      prompt: {
        // dense: true,
        square: true,
        outlined: true,
        maxlength: 50,
        // class: "q-mt-2",
        model: "",
        type: "url", // optional
      },
      cancel: true,
      persistent: true,
    }).onOk(async (name: string) => {
      if (store.state.editor.project) {
        await _addRemote({
          fs,
          dir: store.state.editor.project,
          remote: name,
          url,
        });

        await updateListRemotes();
      }
    });
  });
}

async function copyURL(url: string) {
  try {
    await Clipboard.write({
      string: url,
    });

    void Toast.show({
      text: "Copied remote URL",
    });
  } catch {
    void Toast.show({
      text: "Copy remote URL failed",
    });
  }
}

async function deleteRemote(remote: string) {
  if (store.state.editor.project) {
    await _deleteRemote({
      fs,
      dir: store.state.editor.project,
      remote,
    });
  }
}
/// fetch, pull
</script>
