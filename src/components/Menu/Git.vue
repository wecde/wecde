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
            'git-configs/set:viewAs',
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
        @click="
          $store.getters['editor/changes-staged.length'] > 0
            ? commit()
            : commitAll()
        "
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
            <q-item
              clickable
              v-ripple
              v-if="existsSubs(item)"
              class="no-min-height"
            >
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
                  <q-separator v-if="isSeparator(item)" />
                  <q-list v-else-if="isSubItem(item)">
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
            <q-separator v-else-if="isSeparator(item)" />
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="item.onClick;"
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

          <Collapse
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
                  <template
                    v-if="$store.getters['editor/changes-staged.length'] > 0"
                  >
                    <q-btn
                      color="inherit"
                      flat
                      dense
                      icon="mdi-undo"
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
                  </template>

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
                :filter="filterStages"
              />
              <Changes-Tree v-else :filter="filterStages" />
            </div>
          </Collapse>

          <Collapse eager>
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
                  <template
                    v-if="
                      $store.getters['editor/changes.length'] -
                        $store.getters['editor/changes-staged.length'] >
                      0
                    "
                  >
                    <q-btn
                      color="inherit"
                      flat
                      dense
                      icon="mdi-undo"
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
                  </template>

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
                :filter="filterUnstages"
              />
              <Changes-Tree v-else :filter="filterUnstages" />
            </div>
          </Collapse>
        </div>
      </template>
    </template>
  </Template-Tab>

  <Free-Component :active="commitManager">
    <template v-slot="{ on }">
      <Commit-Manager v-model="commitManager" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="branchManager">
    <template v-slot="{ on }">
      <Branch-Manager v-model="branchManager" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="remoteManager">
    <template v-slot="{ on }">
      <Remote-Manager v-model="remoteManager" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="tagManager">
    <template v-slot="{ on }">
      <Tag-Manager v-model="tagManager" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="log">
    <template v-slot="{ on }">
      <Log v-model="log" v-on="on" />
    </template>
  </Free-Component>
</template>

<script lang="ts" setup>
import Collapse from "components/Collapse.vue";
import FreeComponent from "components/FreeComponent.vue";
import BranchManager from "components/Git/BranchManager.vue";
import ChangesList from "components/Git/ChangesList.vue";
import ChangesTree from "components/Git/ChangesTree.vue";
import CommitManager from "components/Git/CommitManager.vue";
import Log from "components/Git/Log.vue";
import RemoteManager from "components/Git/RemoteManager.vue";
import TagManager from "components/Git/TagManager.vue";
import git, { checkout as _checkout } from "isomorphic-git";
import http from "isomorphic-git/http/web";
import fs from "modules/fs";
import { join } from "path-cross";
import { registerWatch } from "src/helpers/fs-helper";
import { useGitHelper } from "src/helpers/useGitHelper";
import { useGitShared } from "src/shared/useGitShared";
import { useStore } from "src/store";
import { computed, ComputedRef, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

const {
  configs: gitConfigs,
  onAuth,
  onAuthFailure,
  onAuthSuccess,
  onDone,
  onError,
  onMessage,
  onProgress,
  onStart,
} = useGitHelper();
const {
  add: _add,
  commit: _commit,
  reset: _reset,
  resetIndex: _resetIndex,
} = useGitShared();

// * states
const commitManager = ref<boolean>(false);
const branchManager = ref<boolean>(false);
const remoteManager = ref<boolean>(false);
const tagManager = ref<boolean>(false);
const log = ref<boolean>(false);
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
  readonly disabled?: boolean;
} & (
  | {
      readonly subs: readonly (SubItem | SeparatorItem)[];
    }
  | {
      readonly onClick: () => void;
    }
);
type Menu = readonly (MenuItem | SeparatorItem)[];

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

function filterStages(
  filepath: string,
  matrix: [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]
): boolean {
  return matrix[2] === 2;
}
function filterUnstages(
  filepath: string,
  matrix: [0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]
): boolean {
  return matrix[2] !== 2;
}

function existsSubs(menuItem: Menu[0]): menuItem is MenuItem & {
  readonly subs: readonly (SubItem | SeparatorItem)[];
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return "subs" in (menuItem as any);
}
function isSeparator(
  menuItem: SubItem | SeparatorItem
): menuItem is SeparatorItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(menuItem as any).separator;
}
function isSubItem(menuItem: SubItem | SeparatorItem): menuItem is SubItem {
  return isSeparator(menuItem) === false;
}

async function refreshGit(): Promise<void> {
  gitOfProjectReady.value =
    !!store.state.editor.project &&
    (await fs.isFile(join(store.state.editor.project, ".git/HEAD")));
}
watch(
  () => store.state.editor.project,
  () => void refreshGit(),
  {
    immediate: true,
  }
);
registerWatch("projects/*/.git/HEAD", () => void refreshGit(), {
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
        onClick: () => store.commit("git-configs/set:viewAs", "list"),
      },
      {
        name: "View as Tree",
        active: computed<boolean>(
          () => store.state["git-configs"].viewAs === "tree"
        ),
        onClick: () => store.commit("git-configs/set:viewAs", "tree"),
      },
      {
        separator: true,
      },
      {
        name: "Sort by Name",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "name"
        ),
        onClick: () => store.commit("git-configs/set:sortBy", "name"),
      },
      {
        name: "Sort by Path",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "path"
        ),
        onClick: () => store.commit("git-configs/set:sortBy", "path"),
      },
      {
        name: "Sort by Status",
        active: computed<boolean>(
          () => store.state["git-configs"].sortBy === "status"
        ),
        onClick: () => store.commit("git-configs/set:sortBy", "status"),
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
      if (
        store.state.system.navTabGit === false &&
        store.state.editor.project
      ) {
        store.commit("system/set:navTabGit", true);

        try {
          onStart("run push");
          await git.push({
            dir: store.state.editor.project,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
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
          if (store.state.editor.project) {
            await fetch({
              singleBranch: true,
            });
            await pull();
            await _checkout({
              fs,
              dir: store.state.editor.project,
              force: true,
              ref: "HEAD",
            });
          }
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
  },
  {
    name: "Remote",
    icon: "mdi-remote-desktop",
    onClick: () => void (remoteManager.value = true),
  },
  {
    name: "Tags",
    icon: "mdi-tag-outline",
    onClick: () => void (tagManager.value = true),
  },
  {
    separator: true,
  },
  {
    name: "Logs",
    icon: "mdi-format-list-bulleted",
    onClick: () => void (log.value = true),
  },
];

async function init(): Promise<void> {
  if (store.state.editor.project && store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

    await git.init({
      fs,
      dir: store.state.editor.project,
    });
    console.log("inited repo");

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
async function commit(): Promise<void> {
  if (store.state.system.navTabGit === false) {
    store.commit("system/set:navTabGit", true);

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
  if (store.state.system.navTabGit === false && store.state.editor.project) {
    store.commit("system/set:navTabGit", true);

    try {
      onStart("run pull");
      await git.pull({
        dir: store.state.editor.project,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
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
  if (store.state.system.navTabGit === false && store.state.editor.project) {
    store.commit("system/set:navTabGit", true);

    try {
      onStart("run pull");
      await git.fetch({
        dir: store.state.editor.project,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      onError(err);
    }

    store.commit("system/set:navTabGit", false);
  }
}
</script>

<style lang="scss">
.q-menu {
  max-height: 70vh;
}
</style>
