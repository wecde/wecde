<template>
  <Template-Tab>
    <template v-slot:title
      >{{ $t("label.source-control") }}
      <q-badge rounded color="primary" :label="changes.length"
    /></template>

    <template v-slot:addons>
      <q-btn
        :icon="
          $store.state['git-configs'].viewAs === 'list'
            ? mdiViewHeadline
            : mdiFileTree
        "
        @click="
          $store.commit(
            'git-configs/setViewAs',
            $store.state['git-configs'].viewAs === 'list' ? 'tree' : 'list'
          )
        "
        flat
        round
        padding="xs"
        size="13px"
      />
      <q-btn
        :icon="mdiCheck"
        flat
        round
        padding="xs"
        size="13px"
        @click="commit(commitMessage)"
      />
      <q-btn
        :icon="mdiReload"
        flat
        round
        padding="xs"
        size="13px"
        @click="refreshStatus"
      />

      <q-btn :icon="mdiDotsHorizontal" flat round padding="xs" size="13px">
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list dense style="min-width: 100px">
            <q-item clickable>
              <q-item-section>View & Sort</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    dense
                    :active="$store.state['git-configs'].viewAs === 'list'"
                    @click="$store.commit('git-configs/setViewAs', 'list')"
                  >
                    <q-item-section>View as List</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    dense
                    :active="$store.state['git-configs'].viewAs === 'tree'"
                    @click="$store.commit('git-configs/setViewAs', 'tree')"
                  >
                    <q-item-section>View as Tree</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item
                    clickable
                    v-close-popup
                    dense
                    :active="$store.state['git-configs'].sortBy === 'name'"
                    @click="$store.commit('git-configs/setSortBy', 'name')"
                  >
                    <q-item-section>Sort by Name</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    dense
                    :active="$store.state['git-configs'].sortBy === 'path'"
                    @click="$store.commit('git-configs/setSortBy', 'path')"
                  >
                    <q-item-section>Sort by Path</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    dense
                    :active="$store.state['git-configs'].sortBy === 'status'"
                    @click="$store.commit('git-configs/setSortBy', 'status')"
                  >
                    <q-item-section>Sort by Status</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="pull">
              <q-item-section>Pull</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="push">
              <q-item-section>Push</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="() => false" disabled>
              <q-item-section>Clone</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="stateModalCheckout = true">
              <q-item-section>Checkout to...</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable>
              <q-item-section>Commit</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit Staged</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit All</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Undo Last Commit</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Abort Rebase</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit Staged (Amend)</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit All (Amend)</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit Staged (Singed Off)</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Commit All (Singed Off)</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Add Co-authors</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Changes</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Stage All Changes</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Unstage All Change</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Discard All Change</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Pull, Push</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Sync</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Pull</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Pull (Rebase)</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Pull from...</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Push</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Push to...</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup dense>
                    <q-item-section>Fetch</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Fetch (Prune)</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Fetch From All Remotes</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Branch</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Merge Branch...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Rebase Branch...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Create Branch...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Create Branch From...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Rename Branch...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Delete Branch...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Publish Branch...</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Remote</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Add Remote...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Remove Remote</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Stash</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Stash</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Stash (Include Untracked)</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Apply Latest Stash</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Apply Stash...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Pop Latest Stash</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Pop Stash...</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Drop Stash...</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item clickable>
              <q-item-section>Tags</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon :name="mdiChevronRight" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <q-list>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Create Tag</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup dense>
                    <q-item-section>Delete Tag</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup>
              <q-item-section>Show Git Output</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents>
      <template v-if="$store.state['git-project'].state === 'unready'">
        The folder curently open donesn't have a git repository. You can
        initialize a repository which will enable source control features
        powered by git.

        <q-btn
          class="full-width q-mt-5"
          color="positive"
          dense
          no-caps
          @click="init"
          >Initialize Repository</q-btn
        >
      </template>

      <template v-else>
        <q-input
          autogrow
          dense
          square
          outlined
          placeholder="Message"
          v-model.trim="commitMessage"
          maxlength="80"
        />

        <div style="position: relative">
          <q-linear-progress
            indeterminate
            color="cyan"
            size="2px"
            rounded
            style="position: absolute; top: 0"
            v-if="loading"
          />

          <div class="q-ml-n4 q-mt-3">
            <div
              class="file-object"
              v-for="item in changes"
              :key="item.fullpath"
              :class="{
                dark: $q.dark.isActive,

                'star-modified': item.status === `*modified`,
                modified: item.status === `modified`,

                'star-deleted': item.status === `*deleted`,
                deleted: item.status === `deleted`,

                'star-undeleted': item.status === `*undeleted`,

                'star-added': item.status === `*added`,
                added: item.status === `added`,
              }"
              v-ripple
            >
              <img
                class="icon-file"
                :src="
                  getIcon({
                    light: false,
                    isOpen: false,
                    isFolder: false,
                    name: item.basename,
                  })
                "
              />

              <div class="full-width text-truncate">
                {{ item.basename }}
                <small class="text-caption" style="opacity: 0.8">{{
                  item.fullpath
                }}</small>
              </div>

              <div class="actions flex no-wrap">
                <q-btn
                  color="inherit"
                  flat
                  dense
                  :icon="mdiUndo"
                  padding="none"
                  size="12.5px"
                />
                <q-btn
                  color="inherit"
                  flat
                  dense
                  :icon="mdiPlus"
                  padding="none"
                  size="12.5px"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </Template-Tab>

  <Git-Modal-Commit
    v-model="stateModalCommit"
    @enter="commit($event.target.value)"
  />
  <Git-Modal-Checkout v-model="stateModalCheckout" />
</template>

<script lang="ts">
import {
  mdiCheck,
  mdiChevronRight,
  mdiDotsHorizontal,
  mdiFileTree,
  mdiPlus,
  mdiReload,
  mdiUndo,
  mdiViewHeadline,
} from "@quasar/extras/mdi-v5";
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import GitModalCheckout from "components/Git/ModalCheckout.vue";
import GitModalCommit from "components/Git/ModalCommit.vue";
import { sort } from "fast-sort";
import ignore from "ignore";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web/index.js";
import {
  fs,
  listFiles as fsListFiles,
  watcher as fsWatcher,
} from "modules/filesystem";
import parseIgnore from "parse-gitignore";
import { basename, join, relative } from "path-cross";
import {
  configs as gitConfigs,
  onAuth,
  onAuthFailure,
  onAuthSuccess,
  onDone,
  onError,
  onMessage,
  onProgress,
  onStart,
} from "src/helpers/git";
import gitStatusCache from "src/helpers/git-status-cache";
import { useStore } from "src/store";
import {
  createTimeoutBy,
  foreachAsync,
  fsAllowReactive,
  mapAsync,
} from "src/utils";
import { computed, defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Change, StatusGit, StatusMatrix } from "./Git.types";
import TemplateTab from "./template/Tab.vue";
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).git = git;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).fs = fs;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).cache = gitStatusCache;

export default defineComponent({
  components: {
    GitModalCheckout,
    GitModalCommit,
    TemplateTab,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();

    const loading = ref<boolean>(false);
    const matrix = ref<StatusMatrix>({});
    const changes = computed<Change[]>(() => {
      const statuss = Object.entries(matrix.value).map(
        ([fullpath, { status, filepath }]) => ({
          fullpath,
          filepath,
          status,
          basename: basename(fullpath),
        })
      );
      switch (store.state["git-configs"].sortBy) {
        case "name":
          return sort(statuss).asc((item) => item.basename);
        case "path":
          return sort(statuss).asc((item) => item.fullpath);
        case "status":
          return sort(statuss).asc([
            (item) => item.status,
            (item) => item.fullpath,
          ]);
        default:
          return statuss;
      }
    });

    const commitMessage = ref<string>("");

    const stateModalCommit = ref<boolean>(false),
      stateModalCheckout = ref<boolean>(false)

    async function refreshStatus() {
      loading.value = true;
      if (store.state.editor.project) {
        matrix.value = {};
        (
          await mapAsync<
            string,
            {
              filepath: string;
              status: StatusGit;
            }
          >(
            [
              ...(await git.listFiles({
                fs,
                dir: store.state.editor.project,
              })),
              ...(
                await fsListFiles(
                  store.state.editor.project,
                  ignore().add([
                    ".git",
                    ...parseIgnore(store.state["git-project"].gitignore),
                  ]),
                  store.state.editor.project
                )
              ).map((item) =>
                relative(store.state.editor.project as string, item)
              ),
            ],
            async (filepath) => ({
              filepath,
              status: await git.status({
                fs,
                dir: store.state.editor.project as string,
                filepath,
                cache: gitStatusCache,
              }),
            })
          )
        )
          .filter(({ status }) => status !== "unmodified")
          .forEach(({ status, filepath }) => {
            if (store.state.editor.project) {
              matrix.value = {
                ...matrix.value,
                [join(store.state.editor.project, filepath)]: {
                  filepath,
                  status,
                },
              };
            }
          });
      }
      loading.value = false;
    }

    fsWatcher.watch(
      ["write:file", "remove:file", "copy:file", "move:file"],
      false,
      (type, to, from) => {
        if (fsAllowReactive(to, store)) {
          createTimeoutBy(
            `tab git watcher ${to}`,
            async () => {
              if (store.state.editor.project) {
                const status = await git.status({
                  fs,
                  dir: store.state.editor.project,
                  filepath: relative(store.state.editor.project, to),
                  cache: gitStatusCache,
                });

                if (status !== "unmodified") {
                  // eslint-disable-next-line functional/immutable-data
                  matrix.value[to] = {
                    status,
                    filepath: relative(store.state.editor.project, to),
                  };
                } else {
                  // eslint-disable-next-line functional/immutable-data
                  delete matrix.value[to];
                }

                if (type === "move:file") {
                  const status = await git.status({
                    fs,
                    dir: store.state.editor.project,
                    filepath: relative(store.state.editor.project, from),
                    cache: gitStatusCache,
                  });

                  if (status !== "unmodified") {
                    // eslint-disable-next-line functional/immutable-data
                    matrix.value[from] = {
                      filepath: relative(store.state.editor.project, from),
                      status,
                    };
                  }
                }
              }
            },
            5000,
            {
              skipme: true,
            }
          );
        }
      }
    );

    void refreshStatus();

    async function init(): Promise<void> {
      store.commit("system/setProgress", true);
      if (store.state.editor.project) {
        await git.init({
          fs,
          dir: store.state.editor.project,
        });
        await store.dispatch("git-project/refresh");
      }
      store.commit("system/setProgress", false);
    }
    async function getRemoteNow(): Promise<string | void> {
      if (store.state.editor.project) {
        return await git.getConfig({
          fs,
          dir: store.state.editor.project,
          path: "remote.origin.url",
        });
      }
    }
    async function commit(message: string): Promise<void> {
      /// check commit message ready

      message = message.trim();

      if (!!message) {
        /// continue commit

        store.commit("system/setProgress", true);
        if (store.state.editor.project) {
          try {
            await foreachAsync(changes.value, async ({ status, filepath }) => {
              if (store.state.editor.project) {
                if (status === "*deleted") {
                  await git.remove({
                    fs,
                    dir: store.state.editor.project,
                    filepath,
                  });
                } else if (status === "*added" || status === "*modified") {
                  await git.add({
                    fs,
                    dir: store.state.editor.project,
                    filepath,
                  });
                }
              }
            });
            /// commit
            const remoteNow = await getRemoteNow();
            await git.commit({
              fs,
              dir: store.state.editor.project,
              author: {
                email: store.getters["git-configs/getConfig"](
                  remoteNow ?? "github.com",
                  "email"
                ),
                name: store.getters["git-configs/getConfig"](
                  remoteNow ?? "github.com",
                  "name"
                ),
              },
              message,
            });

            void refreshStatus();
          } catch (err) {
            store.commit("terminal/error", err);
          } finally {
            stateModalCommit.value = false;
          }
        }
        store.commit("system/setProgress", false);
      } else {
        stateModalCommit.value = true;
      }
    }
    async function pull(remote = "origin"): Promise<void> {
      store.commit("system/setProgress", true);
      if (store.state.editor.project) {
        try {
          onStart(i18n.t("alert.pulling"));
          await git.pull({
            fs,
            http,
            onProgress,
            onMessage,
            onAuth,
            onAuthFailure,
            onAuthSuccess,
            dir: store.state.editor.project,
            ...gitConfigs,
            remote,
          });
          onDone();
          void refreshStatus();
        } catch (err) {
          onError(err);
        }
      }
      store.commit("system/setProgress", false);
    }
    async function push(remote = "origin"): Promise<void> {
      store.commit("system/setProgress", true);
      if (store.state.editor.project) {
        try {
          onStart(i18n.t("alert.pushing"));
          await git.push({
            fs,
            http,
            onProgress,
            onMessage,
            onAuth,
            onAuthFailure,
            onAuthSuccess,
            dir: store.state.editor.project,
            remote,
          });
          onDone();
        } catch (err) {
          onError(err);
        }
      }
      store.commit("system/setProgress", false);
    }

    return {
      mdiCheck,
      mdiChevronRight,
      mdiDotsHorizontal,
      mdiFileTree,
      mdiPlus,
      mdiReload,
      mdiUndo,
      mdiViewHeadline,

      getIcon,
      refreshStatus,

      loading,
      matrix,
      changes,
      commitMessage,

      stateModalCommit,
      stateModalCheckout,

      init,
      commit,
      pull,
      push,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "components/File Explorer/ListItem.scss";
@import "components/File Explorer/Rename.scss";

.file-object {
  @include file-object($enable-git: true);
  padding: {
    left: 0;
    right: 0;
  }
}
.icon-file {
  @include icon-file();
}
</style>
