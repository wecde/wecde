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
        <div class="text-weight-medium text-subtitle1">Branch manager</div>
        <q-space />

        <q-btn icon="mdi-plus" v-ripple flat round dense @click="branch" />
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

        <q-list
          padding
          class="q-mx-n4"
          v-if="
            (allBranches.heads?.length || 0) +
              (allBranches.remotes?.length || 0) +
              (allBranches.tags?.length || 0) >
            0
          "
        >
          <template v-for="(branches, type) in allBranches" :key="type">
            <q-item
              clickable
              v-ripple
              v-for="branch in branches"
              :key="branch.path"
              class="no-min-height"
            >
              <q-item-section>
                <q-item-label>
                  {{ branch.name }}
                  <small
                    :class="{
                      'text-secondary': type === 'heads',
                      'text-info': type === 'remotes',
                      'text-positive': type === 'tags',
                    }"
                  >
                    <template v-if="type === 'remotes'">
                      Remote branch at
                    </template>
                    <template v-else-if="type === 'tags'"> Tag at </template>
                    {{ branch["last-oid"].slice(0, 8) }}
                  </small>
                </q-item-label>
                <q-item-label caption>{{ branch.path }}</q-item-label>
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
                        @click="checkout(branch.path)"
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="ti-share" />
                        </q-item-section>
                        <q-item-section>Checkout</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        v-ripple
                        class="no-min-height"
                        @click="renameBranch(branch.path)"
                        v-if="type !== 'tags'"
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="ti-pencil" />
                        </q-item-section>
                        <q-item-section>Rename Branch</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        v-ripple
                        class="no-min-height"
                        @click="merge(branch.path)"
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="mdi-source-merge" />
                        </q-item-section>
                        <q-item-section>Merge Branch</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        v-ripple
                        class="no-min-height"
                        @click="deleteBranch(branch.path)"
                        v-if="type !== 'tags'"
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="mdi-source-branch-minus" />
                        </q-item-section>
                        <q-item-section>Delete Branch</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-ripple
                        class="no-min-height"
                        @click="deleteTag(branch.name)"
                        v-else
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="mdi-tag-minus-outline" />
                        </q-item-section>
                        <q-item-section>Delete Tag</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        v-ripple
                        class="no-min-height"
                        @click="forkBranch(branch.path)"
                      >
                        <q-item-section avatar class="min-width-0">
                          <q-icon name="mdi-source-fork" />
                        </q-item-section>
                        <q-item-section>Fork Branch</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
        <div class="text-center q-py-3" v-else>
          No Branch. Click + to add aremote.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  branch as _branch,
  checkout as _checkout,
  deleteBranch as _deleteBranch,
  deleteTag as _deleteTag,
  merge as _merge,
  renameBranch as _renameBranch,
} from "isomorphic-git";
import fs from "modules/fs";
import { basename } from "path-cross";
import { useQuasar } from "quasar";
import { onError } from "src/helpers/git-helper";
import { listAllBranches } from "src/shared/git-shared";
import { useStore } from "src/store";
import { ref } from "vue";

const store = useStore();
const $q = useQuasar();

const loading = ref<boolean>(false);

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
const allBranches = ref<ThenArg<ReturnType<typeof listAllBranches>>>({});

void listAllBranches().then((val) => void (allBranches.value = val));

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
function renameBranch(ref: string) {
  $q.dialog({
    title: "Rename branch",
    message: "Branch's new name:",
    prompt: {
      // dense: true,
      square: true,
      outlined: true,
      maxlength: 20,
      // class: "q-mt-2",
      model: basename(ref),
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (newName: string) => {
    newName = newName.replace(/\s/g, "-");

    if (store.state.editor.project) {
      loading.value = true;

      try {
        await _renameBranch({
          fs,
          dir: store.state.editor.project,
          ref: basename(newName),
          oldref: basename(ref),
        });
      } catch (err) {
        onError(err);
      }

      allBranches.value = await listAllBranches();
      loading.value = false;
    }
  });
}
async function merge(ref: string) {
  if (store.state.editor.project) {
    loading.value = true;

    try {
      await _merge({
        fs,
        dir: store.state.editor.project,
        ours: "HEAD",
        theirs: ref,
      });
    } catch (err) {
      onError(err);
    }

    allBranches.value = await listAllBranches();
    loading.value = false;
  }
}
async function deleteBranch(ref: string) {
  if (store.state.editor.project) {
    loading.value = true;

    try {
      await _deleteBranch({
        fs,
        dir: store.state.editor.project,
        ref,
      });
    } catch (err) {
      onError(err);
    }

    allBranches.value = await listAllBranches();
    loading.value = false;
  }
}
async function deleteTag(ref: string) {
  if (store.state.editor.project) {
    loading.value = true;

    try {
      await _deleteTag({
        fs,
        dir: store.state.editor.project,
        ref,
      });
    } catch (err) {
      onError(err);
    }

    allBranches.value = await listAllBranches();
    loading.value = false;
  }
}
function forkBranch(ref: string) {
  $q.dialog({
    title: "Fork branch",
    message: "The name of the new branch:",
    prompt: {
      // dense: true,
      square: true,
      outlined: true,
      maxlength: 20,
      // class: "q-mt-2",
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (nameNewRef: string) => {
    nameNewRef = nameNewRef.replace(/\s/g, "-");

    if (store.state.editor.project) {
      // checkout to ref
      await _checkout({
        fs,
        dir: store.state.editor.project,
        force: true,
        ref,
      });

      // branch

      await _branch({
        fs,
        dir: store.state.editor.project,
        ref: nameNewRef,
        checkout: true,
      });

      allBranches.value = await listAllBranches();
    }
  });
}
function branch() {
  $q.dialog({
    title: "Create branch",
    message: "The name of the new branch:",
    prompt: {
      // dense: true,
      square: true,
      outlined: true,
      maxlength: 20,
      // class: "q-mt-2",
      model: "",
      type: "text", // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (nameNewRef: string) => {
    nameNewRef = nameNewRef.replace(/\s/g, "-");

    if (store.state.editor.project) {
      await _branch({
        fs,
        dir: store.state.editor.project,
        ref: nameNewRef,
        checkout: true,
      });

      allBranches.value = await listAllBranches();
    }
  });
}
</script>
