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
        @click="commitAll(commitMessage)"
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
            dense
            style="min-width: 100px"
            v-for="(item, index) in menu"
            :key="index"
          >
            <q-item clickable v-if="item.subs">
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
                      dense
                      :active="item.active?.value"
                      :disabled="item.disabled"
                      @click="item.onClick"
                    >
                      <q-item-section>{{ item.name }}</q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </q-menu>
            </q-item>
            <q-separator v-else-if="item.separator" />
            <q-item clickable v-close-popup @click="item.onClick" v-else>
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

          <App-Collapse
            eager
            v-if="$store.getters['editor/changes-staged.length'] !== 0"
          >
            <template v-slot:activator="{ on, state }">
              <div
                v-on="on"
                class="toolbar flex no-wrap justify-between items-center q-py-1"
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
                    icon="mdi-undo"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="reset('', true, true)"
                  />
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-minus"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="resetIndex('', true)"
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
              <ChangesList
                v-if="$store.state['git-configs'].viewAs === 'list'"
                :filter="(filepath, matrix) => matrix[2] === 2"
              />
              <ChangesTree
                v-else
                :filter="(filepath, matrix) => matrix[2] === 2"
              />
            </div>
          </App-Collapse>

          <App-Collapse eager>
            <template v-slot:activator="{ on, state }">
              <div
                v-on="on"
                class="toolbar flex no-wrap justify-between items-center q-py-1"
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
                    icon="mdi-undo"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="reset('', false, true)"
                  />
                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-plus"
                    padding="none"
                    size="12.5px"
                    rounded
                    @click.prevent.stop="add('', true)"
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
              <ChangesList
                v-if="$store.state['git-configs'].viewAs === 'list'"
                :filter="(filepath, matrix) => matrix[2] !== 2"
              />
              <ChangesTree
                v-else
                :filter="(filepath, matrix) => matrix[2] !== 2"
              />
            </div>
          </App-Collapse>
        </div>
      </template>
    </template>
  </Template-Tab>

  <Commit-Manager :model-value="true" />
</template>

<script lang="ts" setup>
import AppCollapse from "components/App/Collapse.vue";
import ChangesList from "components/Git/ChangesList.vue";
import ChangesTree from "components/Git/ChangesTree.vue";
import CommitManager from "components/Git/CommitManager"
import git from "isomorphic-git";
import fs from "modules/fs";
import { join } from "path-cross";
import { registerWatch } from "src/helpers/fs";
import { add, commitAll, reset, resetIndex } from "src/shared/git";
import { useStore } from "src/store";
import { computed, ComputedRef, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

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
  readonly subs: readonly (SubItem | SeparatorItem)[];
};
type Menu = readonly (MenuItem | SubItem | SeparatorItem)[];

const store = useStore();

const loading = ref<boolean>(false);
const gitOfProjectReady = ref<boolean>(false);
const commitMessage = ref<string>("");

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
  },
  {
    name: "Push",
  },
  {
    name: "Clone",
    onClick: () => void 0,
    disabled: true,
  },
  {
    name: "Checkout to...",
  },
  {
    separator: true,
  },
  {
    name: "Commit",
    subs: [
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
    ],
  },
  {
    name: "Changes",
    subs: [
      {
        name: "Stage All Changes",
      },
      {
        name: "Unstage All Change",
      },
      {
        name: "Discard All Change",
      },
    ],
  },
  {
    name: "Pull, Push",
    subs: [
      {
        name: "Sync",
      },
      {
        separator: true,
      },
      {
        name: "Pull",
      },
      {
        name: "Pull (Rebase)",
      },
      {
        name: "Pull from...",
      },
      {
        separator: true,
      },
      {
        name: "Fetch",
      },
      {
        name: "Fetch (Prune)",
      },
      {
        name: "Fetch From All Remotes",
      },
    ],
  },
  {
    name: "Branch",
    subs: [
      {
        name: "Merge Branch...",
      },
      {
        name: "Rebase Branch...",
      },
      {
        name: "Create Branch...",
      },
      {
        name: "Create Branch From...",
      },
      {
        name: "Rename Branch...",
      },
      {
        name: "Delete Branch...",
      },
      {
        name: "Publish Branch...",
      },
    ],
  },
  {
    name: "Remote",
    subs: [
      {
        name: "Add Remote...",
      },
      {
        name: "Remove Remote",
      },
    ],
  },
  {
    name: "Stash",
    subs: [
      {
        name: "Stash",
      },
      {
        name: "Stash (Include Untracked)",
      },
      {
        name: "Apply Latest Stash",
      },
      {
        name: "Apply Stash...",
      },
      {
        name: "Pop Latest Stash",
      },
      {
        name: "Pop Stash...",
      },
      {
        name: "Drop Stash...",
      },
    ],
  },
  {
    name: "Tags",
    subs: [
      {
        name: "Create Tag",
      },
      {
        name: "Delete Tag",
      },
    ],
  },
  {
    separator: true,
  },
  {
    name: "Show Git Output",
  },
];

async function init(): Promise<void> {
  if (store.state.editor.project) {
    loading.value = true;

    await git.init({
      fs,
      dir: store.state.editor.project,
    });

    loading.value = false;
  }
}
</script>
