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
        <div class="text-weight-medium text-subtitle1">Log commits</div>
        <q-space />

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

        <q-infinite-scroll @load="onLoad">
          <div class="item q-mb-4" v-for="log in logs" :key="log.oid">
            <div class="flex no-wrap items-center justify-between">
              <q-chip
                outline
                color="primary"
                text-color="white"
                icon="mdi-source-branch"
                class="q-my-2 q-mr-1"
              >
                {{ log.oid.slice(0, 8) }}
              </q-chip>

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
                      @click="checkout(log.oid)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-share" />
                      </q-item-section>
                      <q-item-section>Undo to Commit</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      class="no-min-height"
                      @click="checkoutNoForce(log.oid)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-back-left" />
                      </q-item-section>
                      <q-item-section>Reset</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      class="no-min-height"
                      @click="copyURL(log.oid)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-layers" />
                      </q-item-section>
                      <q-item-section>Copy SHA</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      class="no-min-height"
                      @click="copyURL(log.commit.author.email)"
                    >
                      <q-item-section avatar class="min-width-0">
                        <q-icon name="ti-layers" />
                      </q-item-section>
                      <q-item-section>Copy Email</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="flex no-wrap items-center justify-between q-mx-2 meta">
              <span>{{
                new Date(log.commit.author.timestamp).toLocaleString()
              }}</span>
              <span class="text-truncate">{{ log.commit.author.name }}</span>
            </div>

            <div class="message q-mt-1">{{ log.commit.message }}</div>
          </div>

          <div class="text-center q-py-3" v-if="logs.length === 0">
            No log. Commits show it.
          </div>
        </q-infinite-scroll>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Clipboard } from "@capacitor/clipboard";
import { Toast } from "@capacitor/toast";
import {
  checkout as _checkout,
  log as _log,
  ReadCommitResult,
} from "isomorphic-git";
import fs from "modules/fs";
import { onError } from "src/helpers/git-helper";
import { useStore } from "src/store";
import { reactive, ref } from "vue";

const store = useStore();

const logs = reactive<ReadCommitResult[]>([]);
const loading = ref<boolean>(false);

async function onLoad(index: number, done: (stop?: boolean) => void) {
  if (store.state.editor.project) {
    const pushLogs = await _log({
      fs,
      dir: store.state.editor.project,
      depth: logs.length + 20,
    });

    // eslint-disable-next-line functional/immutable-data
    logs.push(...pushLogs.slice(logs.length));

    done(pushLogs.slice(logs.length).length === 0);
  }
}

async function checkout(ref: string) {
  if (store.state.editor.project) {
    loading.value = true;

    try {
      await _checkout({
        fs,
        dir: store.state.editor.project,
        force: true,
        ref,
      });
    } catch (err) {
      onError(err);
    }

    loading.value = false;
  }
}
async function checkoutNoForce(ref: string) {
  if (store.state.editor.project) {
    loading.value = true;

    try {
      await _checkout({
        fs,
        dir: store.state.editor.project,
        force: false,
        ref,
      });
    } catch (err) {
      onError(err);
    }

    loading.value = false;
  }
}

async function copyURL(url: string) {
  try {
    await Clipboard.write({
      string: url,
    });

    void Toast.show({
      text: "Copied",
    });
  } catch {
    void Toast.show({
      text: "Copy failed",
    });
  }
}
</script>

<style lang="scss" scoped>
.item {
  .meta {
    color: #eddaaa;
    font-size: 12px;
    opacity: 0.9;
  }
  .message {
    font-size: 14px;
    padding-left: 1em;
  }
}
</style>
