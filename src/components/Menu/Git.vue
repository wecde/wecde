<template>
  <Template-Tab no-flat contents-class="q-mt-3">
    <template v-slot:title
      >{{ $t("label.source-control") }}
      <q-badge
        rounded
        color="primary"
        :label="$store.getters['editor/changes.length']"
    /></template>

    <template v-slot:addons>
      <q-btn
        :icon="
          $store.state['git-configs'].viewAs === 'list'
            ? 'mdi-view-headline'
            : 'mdi-file-tree'
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
        icon="mdi-check"
        flat
        round
        padding="xs"
        size="13px"
        @click="commitAll"
      />
      <q-btn icon="mdi-reload" flat round padding="xs" size="13px" />

      <q-btn icon="mdi-dots-horizontal" flat round padding="xs" size="13px">
        <q-menu
          :class="{
            'bg-grey-9': $q.dark.isActive,
          }"
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list
            style="min-width: 100px"
            v-for="(item, index) in menu"
            :key="index"
          >
            <q-item clickable v-ripple v-if="item.subs" class="no-min-height">
              <q-item-section side class="q-mr-0">
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.name }}</q-item-section>
              <q-item-section side class="q-mr-n4">
                <q-icon name="mdi-chevron-right" />
              </q-item-section>
              <q-menu
                :class="{
                  'bg-grey-9': $q.dark.isActive,
                }"
                auto-close
                anchor="top end"
                self="top start"
              >
                <template v-for="(item, index) in item.subs" :key="index">
                  <q-separator v-if="item.separator" />
                  <q-list v-else>
                    <q-item
                      clickable
                      v-close-popup
                      v-ripple
                      :active="item.active?.value"
                      :disabled="item.disabled"
                      @click="item.onClick"
                      class="no-min-height"
                    >
                      <q-item-section>{{ item.name }}</q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </q-menu>
            </q-item>
            <q-separator v-else-if="item.separator" />
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="item.onClick"
              class="no-min-height"
              v-else
            >
              <q-item-section side class="q-mr-0">
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents>
      <template v-if="gitOfProjectReady === false">
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
          color="blue"
        />

        <div style="position: relative" class="q-mt-3">
          <q-linear-progress
            indeterminate
            color="cyan"
            size="2px"
            rounded
            style="position: absolute; top: 0"
            v-if="store.state.system.navTabGit"
          />

          <App-Collapse
            eager
            v-if="$store.getters['editor/changes-staged.length'] !== 0"
          >
            <template v-slot:activator="{ on, state }">
              <div
                v-on="on"
                class="flex no-wrap justify-between items-center q-py-1"
              >
                <div>
                  <q-icon
                    color="inherit"
                    :name="state ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                    size="1.3em"
                  />
                  Staged
                </div>

                <div class="self-end">
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="ti-back-left"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="reset(filesStaged)"
                  />
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-minus"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="resetIndex(filesStaged)"
                  />

                  <q-badge
                    rounded
                    color="primary"
                    :label="$store.getters['editor/changes-staged.length']"
                  />
                </div>
              </div>
            </template>

            <div class="q-ml-n4">
              <Changes-List
                v-if="$store.state['git-configs'].viewAs === 'list'"
                :filter="(filepath, matrix) => matrix[2] === 2"
              />
              <Changes-Tree
                v-else
                :filter="(filepath, matrix) => matrix[2] === 2"
              />
            </div>
          </App-Collapse>

          <App-Collapse eager>
            <template v-slot:activator="{ on, state }">
              <div
                v-on="on"
                class="flex no-wrap justify-between items-center q-py-1"
              >
                <div>
                  <q-icon
                    color="inherit"
                    :name="state ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                    size="1.3em"
                  />
                  Changes
                </div>

                <div class="self-end">
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="ti-back-left"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="reset(filesChanges)"
                  />
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-plus"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="add(filesChanges)"
                  />

                  <q-badge
                    rounded
                    color="primary"
                    :label="
                      $store.getters['editor/changes.length'] -
                      $store.getters['editor/changes-staged.length']
                    "
                  />
                </div>
              </div>
            </template>

            <div class="q-ml-n4">
              <Changes-List
                v-if="$store.state['git-configs'].viewAs === 'list'"
                :filter="(filepath, matrix) => matrix[2] !== 2"
              />
              <Changes-Tree
                v-else
                :filter="(filepath, matrix) => matrix[2] !== 2"
              />
            </div>
          </App-Collapse>
        </div>
      </template>
    </template>
  </Template-Tab>

  <Commit-Manager v-model="commitManager" />
  <Branch-Manager v-model="branchManager" />
  <Remote-Manager v-model="remoteManager" />
</template>

<script lang="ts" setup>
import AppCollapse from "components/App/Collapse.vue";
import BranchManager from "components/Git/BranchManager.vue";
import ChangesList from "components/Git/ChangesList.vue";
import ChangesTree from "components/Git/ChangesTree.vue";
import CommitManager from "components/Git/CommitManager.vue";
import RemoteManager from "components/Git/RemoteManager.vue";
import git, { checkout as _checkout } from "isomorphic-git";
import http from "isomorphic-git/http/web";
import fs from "modules/fs";
import { join } from "path-cross";
import { registerWatch } from "src/helpers/fs";
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
import {
  add as _add,
  commit as _commit,
  reset as _reset,
  resetIndex as _resetIndex,
} from "src/shared/git-shared";
import { useStore } from "src/store";
import { computed, ComputedRef, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

// * states
const commitManager = ref<boolean>(false);
const branchManager = ref<boolean>(false);
const remoteManager = ref<boolean>(false);
const tagManager = ref<boolean>(false);
// *

type SubItem = {
  readonly name: string;
  readonly disabled?: boolean;
  readonly active?: ComputedRef<boolean>;
  readonly onClick?: () => void;
};
type SeparatorItem = {
  readonly separator: true;
};
type MenuItem = {
  readonly name: string;
  readonly icon: string;
  readonly subs: readonly (SubItem | SeparatorItem)[];
};
type Menu = readonly (MenuItem | SubItem | SeparatorItem)[];

const store = useStore();

const gitOfProjectReady = ref<boolean>(false);
const commitMessage = ref<string>("");

const filesStaged = computed<readonly string[]>(() => {
  return Object.keys(store.state.editor.git.statusMatrix.matrix).filter(
    (item) => {
      return store.state.editor.git.statusMatrix.matrix[item][2] === 2;
    }
  );
});
const filesChanges = computed<readonly string[]>(() => {
  return Object.keys(store.state.editor.git.statusMatrix.matrix).filter(
    (item) => {
      return store.state.editor.git.statusMatrix.matrix[item][2] !== 2;
    }
  );
});

async function refreshGit(): Promise<void> {
  gitOfProjectReady.value =
    !!store.state.editor.project &&
    (await fs.isFile(join(store.state.editor.project, ".git/index")));
}
watch(
  () => store.state.editor.project,
  () => void refreshGit(),
  {
    immediate: true,
  }
);
registerWatch("projects/*/.git/index", () => void refreshGit(), {
  dir: () => store.state.editor.project,
  miniOpts: {
    dot: true,
  },
});

const menu: Menu = [
  {
    name: "View & Sort",
    icon: "mdi-sort",
    subs: [
      {
        name: "View as List",
        active: computed<boolean>(
          () => store.state["git-configs"].viewAs === "list"
        ),
        onClick: () => store.commit("git-configs/setViewAs", "list"),
      },
      {
        name: "View as Tree",
        active: computed<boolean>(
          () => store.state["git-configs"].viewAs === "tree"
        ),
        onClick: () => store.commit("git-configs/setViewAs", "tree"),
      },
      {
        separator: true,
      },
      {
        name: "Sort by Name",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "name"
        ),
        onClick: () => store.commit("git-configs/setSortBy", "name"),
      },
      {
        name: "Sort by Path",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "path"
        ),
        onClick: () => store.commit("git-configs/setSortBy", "path"),
      },
      {
        name: "Sort by Status",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "status"
        ),
        onClick: () => store.commit("git-configs/setSortBy", "status"),
      },
    ],
  },
  {
    separator: true,
  },
  {
    name: "Pull",
    icon: "mdi-source-pull",
    onClick: async () => {
      await fetch({
        singleBranch: true,
      });
      await pull();
    },
  },
  {
    name: "Push",
    icon: "mdi-source-merge",
    onClick: async () => {
      if (store.state.system.navTabGit === false) {
        store.commit("system/set:navTabGit", true);

        try {
          onStart("run push");
          await git.push({
            dir: store.state.editor.project as string,
            fs,
            http,
            ref: "HEAD",
            ...gitConfigs,
            onAuth,
            onAuthSuccess,
            onAuthFailure,
            onProgress,
            onMessage,
            remote: "origin",
          });
          onDone();
        } catch (err) {
          onError(err);
        }

        store.commit("system/set:navTabGit", false);
      }
    },
  },
  {
    name: "Clone",
    icon: "mdi-source-repository",
    onClick: () => void 0,
    disabled: true,
  },
  {
    name: "Checkout to...",
    icon: "ti-share", // mdi-book-open-page-variant
    onClick: () => void (branchManager.value = true),
  },
  {
    separator: true,
  },
  {
    name: "Commit",
    icon: "mdi-source-commit",
    onClick: () => void (commitManager.value = true),
    /*subs: [
      {
        name: "Commit",
      },
      {
        name: "Commit Staged",
      },
      {
        name: "Commit All",
      },
      {
        name: "Undo Last Commit",
      },
      {
        name: "Abort Rebase",
      },
      {
        separator: true,
      },
      {
        name: "Commit Staged (Amend)",
      },
      {
        name: "Commit All (Amend)",
      },
      {
        separator: true,
      },
      {
        name: "Commit Staged (Singed Off)",
      },
      {
        name: "Commit All (Singed Off)",
      },
      {
        separator: true,
      },
      {
        name: "Add Co-authors",
      },
    ],*/
  },
  {
    name: "Changes",
    icon: "mdi-key-change",
    subs: [
      {
        name: "Stage All Changes",
        onClick: async () => {
          await add(Object.keys(store.state.editor.git.statusMatrix.matrix));
        },
      },
      {
        name: "Unstage All Change",
        onClick: async () => {
          await resetIndex(
            Object.keys(store.state.editor.git.statusMatrix.matrix)
          );
        },
      },
      {
        name: "Discard All Change",
        onClick: async () => {
          await reset(Object.keys(store.state.editor.git.statusMatrix.matrix));
        },
      },
    ],
  },
  {
    name: "Pull, Push",
    icon: "mdi-source-pull",
    subs: [
      {
        name: "Sync",
      },
      {
        separator: true,
      },
      {
        name: "Pull",
        onClick: async () => {
          await fetch({
            singleBranch: true,
          });
          await pull();
        },
      },
      {
        name: "Pull (Rebase)",
        onClick: async () => {
          await fetch({
            singleBranch: true,
          });
          await pull();
          await _checkout({
            fs,
            dir: store.state.editor.project as string,
            force: true,
            ref: "HEAD",
          });
        },
      },
      {
        name: "Pull from...",
        onClick: () => void (remoteManager.value = true),
      },
      {
        separator: true,
      },
      {
        name: "Fetch",
        onClick: async () => {
          await fetch({
            singleBranch: true,
          });
        },
      },
      {
        name: "Fetch (Prune)",
        onClick: async () => {
          await fetch({
            singleBranch: true,
            prune: true,
          });
        },
      },
      {
        name: "Fetch From All Remotes",
        onClick: async () => fetch(),
      },
    ],
  },
  {
    name: "Branch",
    icon: "mdi-source-branch",
    onClick: () => void (branchManager.value = true),
    // subs: [
    //   {
    //     name: "Merge Branch...",
    //   },
    //   {
    //     name: "Rebase Branch...",
    //   },
    //   {
    //     name: "Create Branch...",
    //   },
    //   {
    //     name: "Create Branch From...",
    //   },
    //   {
    //     name: "Rename Branch...",
    //   },
    //   {
    //     name: "Delete Branch...",
    //   },
    //   {
    //     name: "Publish Branch...",
    //   },
    // ],
  },
  {
    name: "Remote",
    icon: "mdi-remote-desktop",
    onClick: () => void (remoteManager.value = true),
    // subs: [
    //   {
    //     name: "Add Remote...",
    //   },
    //   {
    //     name: "Remove Remote",
    //   },
    // ],
  },
  {
    name: "Tags",
    icon: "mdi-tag-outline",
    onClick: () => void (tagManager.value = true),
  },
];

async function init(): Promise<void> {
  if (store.state.editor.project && store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await git.init({
      fs,
      dir: store.state.editor.project,
    });

    store.commit("system/set:navTabGit", false);
  }
}
async function commitAll(): Promise<void> {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await _add(Object.keys(store.state.editor.git.statusMatrix.matrix));
    await _commit({
      message: commitMessage.value,
      amend: false,
      noEdit: false,
    });

    store.commit("system/set:navTabGit", false);
  }
}
async function add(filepaths: readonly string[]) {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await _add(filepaths);

    store.commit("system/set:navTabGit", false);
  }
}
async function reset(filepaths: readonly string[]) {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await _reset(filepaths);

    store.commit("system/set:navTabGit", false);
  }
}
async function resetIndex(filepaths: readonly string[]) {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await _resetIndex(filepaths);

    store.commit("system/set:navTabGit", false);
  }
}
async function pull() {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    try {
      onStart("run pull");
      await git.pull({
        dir: store.state.editor.project as string,
        fs,
        http,
        ref: "HEAD",
        ...gitConfigs,
        onAuth,
        onAuthSuccess,
        onAuthFailure,
        onProgress,
        onMessage,
      });
      onDone();
    } catch (err) {
      onError(err);
    }

    store.commit("system/set:navTabGit", false);
  }
}
async function fetch({
  singleBranch,
  prune,
}: {
  singleBranch?: boolean;
  prune?: boolean;
} = {}): Promise<void> {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    try {
      onStart("run pull");
      await git.fetch({
        dir: store.state.editor.project as string,
        fs,
        http,
        ...gitConfigs,
        onAuth,
        onAuthSuccess,
        onAuthFailure,
        onProgress,
        onMessage,
        singleBranch,
        prune,
      });
      onDone();
    } catch (err) {
      onError(err);
    }

    store.commit("system/set:navTabGit", false);
  }
}
</script>
