<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("label.project") }}</template>

    <template v-slot:addons>
      <q-btn
        :icon="mdiReload"
        @click="reloadListProjects(true)"
        flat
        round
        padding="none"
        size="1em"
      />
      <q-btn
        :icon="mdiGit"
        flat
        round
        padding="none"
        size="1em"
        class="q-ml-xs"
      >
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list bordered>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="statePopupGitClone = true"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiGit" />
              </q-item-section>
              <q-item-section>{{ $t("label.clone-repo") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="statePopupGitProvide = true"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiLockOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.credentials") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        :icon="mdiPlus"
        flat
        round
        padding="none"
        size="1em"
        class="q-ml-xs"
      >
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <q-list bordered>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="creatingProject = true"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiArchiveOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-project") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="importProjectFromZip"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiZipBoxOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.import-zip") }}</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="$router.push(`/?tab=logs`)"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiMessageTextOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.change-logs") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup v-ripple @click="$router.push(`/`)">
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiCubeOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.view-labs") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents>
      <q-list class="q-mx-n4">
        <Project-Item
          v-for="item in projects"
          :key="item.fullpath"
          :project="item"
          :names-exists="projects.map((item) => basename(item.fullpath))"
          @click:delete="projectRemoving = item"
        />
      </q-list>
    </template>

    <template v-slot:others>
      <q-dialog
    class="max-width-dialog inner-bottom-auto"
        full-width
        transition-show="jump-down"
        transition-hide="jump-up"
        :model-value="!!projectRemoving"
        @update:model-value="$event ? null : (projectRemoving = null)"
      >
        <q-card class="flex column no-wrap">
          <q-card-section class="row items-center q-pb-1 q-pt-2">
            <div class="text-weight-medium text-subtitle1">
              {{ $t("label.delete-project") }}
            </div>
            <q-space />
            <q-btn :icon="mdiClose" v-ripple flat round dense v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section class="fit scroll q-pt-2 q-pb-3">
            {{ $t("label.type") }} <span class="text-blue">{{ code }}</span>
            {{ $t("label.to-confirm") }}
            <span class="text-blue">{{
              projectRemoving && basename(projectRemoving.fullpath)
            }}</span>
            {{ $t("label.not-recovery") }}
            <q-input
              dense
              :rules="[
                () =>
                  code === codeInput ? true : $t('error.match-code', { code }),
              ]"
              required
              v-model.trim="codeInput"
              @keypress.enter="remove"
              autofocus
            />
          </q-card-section>

          <q-card-actions align="between">
            <q-btn
              :label="$t('label.cancel')"
              flat
              dense
              color="primary"
              v-close-popup
            />
            <q-btn
              :label="$t('label.ok')"
              flat
              dense
              color="primary"
              @click="remove"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <Git-Clone v-model:state="statePopupGitClone" @cloned="clonedRepo" />
      <Git-Provide v-model:state="statePopupGitProvide" />
      <Project-Create
        v-model:state="creatingProject"
        @created="reloadListProjects"
        :names-exists="projects.map((item) => basename(item.fullpath))"
      />
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import {
  mdiArchiveOutline,
  mdiClose,
  mdiCubeOutline,
  mdiGit,
  mdiLockOutline,
  mdiMessageTextOutline,
  mdiPlus,
  mdiReload,
  mdiZipBoxOutline,
} from "@quasar/extras/mdi-v5";
import { basename } from "path-cross";
import GitClone from "src/components/Git/ModalGitClone.vue";
import GitProvide from "src/components/Git/ModalGitProvide.vue";
import ProjectCreate from "src/components/Project/Create.vue";
import ProjectItem from "src/components/Project/Item.vue";
import { readdirStat, rmdir } from "src/modules/filesystem";
import type { StatItem } from "src/modules/filesystem";
import importZip from "src/modules/import-zip";
import { random } from "src/utils";
import { defineComponent, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

export default defineComponent({
  emits: ["open:project"],
  components: {
    TemplateTab,
    ProjectItem,
    ProjectCreate,
    GitProvide,
    GitClone,
  },
  setup() {
    const projects = ref<StatItem[]>([]);
    const creatingProject = ref<boolean>(false);
    const projectRemoving = ref<null | StatItem>(null);
    const code = ref<null | string>(null);
    const codeInput = ref<null | string>(null);

    watch(projectRemoving, (newValue) => {
      if (newValue) {
        code.value = [random(9), random(9), random(9)].join("");
      } else {
        code.value = null;
      }
    });
    watch(code, () => {
      codeInput.value = null;
    });

    return {
      mdiReload,
      mdiGit,
      mdiLockOutline,
      mdiPlus,
      mdiArchiveOutline,
      mdiZipBoxOutline,
      mdiMessageTextOutline,
      mdiCubeOutline,
      mdiClose,

      projects,

      creatingProject,

      projectRemoving,

      code,
      codeInput,
      statePopupGitClone: ref<boolean>(false),
      statePopupGitProvide: ref<boolean>(false),
    };
  },
  async created() {
    await this.reloadListProjects();
  },
  methods: {
    basename,

    async reloadListProjects(notification = false): Promise<void> {
      this.$store.commit("system/setProgress", true);
      try {
        this.projects = (await readdirStat("projects"))
          .filter((project) => {
            return project.stat.type === "directory";
          })
          .sort((a, b) => {
            return b.stat.mtime - a.stat.mtime;
          });
      } catch {
        this.projects = [];
      }
      this.$store.commit("system/setProgress", false);
      if (notification) {
        void Toast.show({
          text: this.$t("alert.reload-projects"),
        });
      }
    },
    async importProjectFromZip(): Promise<void> {
      try {
        const names = await importZip("projects/");
        this.$store.commit("terminal/clear");
        void Toast.show({
          text: this.$t("alert.imported-project", {
            list: names.map((item) => `"${item}"`).join(", "),
          }),
        });
      } catch (err) {
        this.$store.commit("terminal/error", err);
      }
      await this.reloadListProjects();
    },
    async remove(): Promise<void> {
      this.$store.commit("system/setProgress", true);
      if (this.code === this.codeInput && this.projectRemoving) {
        try {
          await rmdir(this.projectRemoving.fullpath);
          void Toast.show({
            text: this.$t("alert.removed.project", {
              name: basename(this.projectRemoving.fullpath),
            }),
          });
        } catch {
          void Toast.show({
            text: this.$t("alert.remove-project-failed", {
              name: basename(this.projectRemoving.fullpath),
            }),
          });
        }

        await this.reloadListProjects();
        this.projectRemoving = null;
      }
      this.$store.commit("system/setProgress", false);
    },
    clonedRepo(): void {
      this.statePopupGitClone = false;
      void this.reloadListProjects();
    },
  },
});
</script>
