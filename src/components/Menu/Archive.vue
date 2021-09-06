<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("label.project") }}</template>

    <template v-slot:addons>
      <q-btn
        icon="mdi-reload"
        @click="reloadListProjects(true)"
        flat
        round
        padding="xs"
        size="13px"
      />
      <q-btn
        icon="mdi-source-branch"
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
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
              @click="statePopupGitClone = true"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-source-branch" />
              </q-item-section>
              <q-item-section>{{ $t("label.clone-repo") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="statePopupGitProvide = true"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-lock-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.credentials") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        icon="mdi-plus"
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
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
              @click="creatingProject = true"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-archive-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-project") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="importProjectFromZip"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-zip-box-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.import-zip") }}</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="$router.push(`/?tab=logs`)"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-message-text-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.change-logs") }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="$router.push(`/`)"
              class="no-min-height"
            >
              <q-item-section avatar class="min-width-0">
                <q-icon name="mdi-cube-outline" />
              </q-item-section>
              <q-item-section>{{ $t("label.view-labs") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents>
      <q-list>
        <q-pull-to-refresh
          @refresh="(done) => void reloadListProjects().then(() => void done())"
          icon="mdi-refresh"
        >
          <Project-Item
            v-for="item in projects"
            :key="item.value.fullpath"
            :project="item.value"
            :git="item.git"
            :names-exists="
              projects.map((item) => basename(item.value.fullpath))
            "
            @click:delete="projectRemoving = item.value"
          />
        </q-pull-to-refresh>
      </q-list>
    </template>
  </Template-Tab>

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
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="fit scroll q-pt-2 q-pb-3">
        {{ $t("label.type") }}
        <span class="text-blue">{{
          `u0/${basename(projectRemoving.fullpath)}`
        }}</span>
        {{ $t("label.to-confirm") }}
        <span class="text-blue">{{
          projectRemoving && basename(projectRemoving.fullpath)
        }}</span>
        {{ $t("label.not-recovery") }}
        <q-input
          dense
          :rules="[
            () =>
              code === codeInput
                ? true
                : $t('error.match-code', {
                    code: `u0/${basename(projectRemoving.fullpath)}`,
                  }),
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

  <Git-Clone v-model="statePopupGitClone" @cloned="clonedRepo" />
  <Git-Provide v-model="statePopupGitProvide" />
  <Project-Create
    v-model="creatingProject"
    @created="reloadListProjects"
    :names-exists="projects.map((item) => basename(item.value.fullpath))"
  />
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import GitClone from "components/Git/ModalGitClone.vue";
import GitProvide from "components/Git/ModalGitProvide.vue";
import ProjectCreate from "components/Project/Create.vue";
import ProjectItem from "components/Project/Item.vue";
import { sort } from "fast-sort";
import fs from "modules/fs";
import { basename, join } from "path-cross";
import { Notify } from "quasar";
import createProjectFromZip from "src/helpers/createProjectFromZip";
import { readdirAndStat, StatItem } from "src/helpers/fs";
import { useStore } from "src/store";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import TemplateTab from "./template/Tab.vue";

defineEmits<{
  (event: "open:project"): void;
}>();

const i18n = useI18n();
const store = useStore();

const projects = ref<
  {
    readonly git: boolean;
    readonly value: StatItem;
  }[]
>([]);
const creatingProject = ref<boolean>(false);
const projectRemoving = ref<null | StatItem>(null);
const codeInput = ref<string>("");
const statePopupGitClone = ref<boolean>(false);
const statePopupGitProvide = ref<boolean>(false);

watch(projectRemoving, () => void (codeInput.value = ""));
void reloadListProjects();

async function reloadListProjects(notification = false): Promise<void> {
  const task = Notify.create({
    spinner: true,
    timeout: 9999999999,
    position: "bottom-right",
    message: i18n.t("alert.reload-projects"),
  });

  try {
    projects.value = sort(
      await Promise.all(
        await readdirAndStat("projects").then((item) => {
          return item
            .filter((project) => project.stat.type === "directory")
            .map(async (item) => {
              return {
                git: await fs.isFile(join(item.fullpath, ".git/index")),
                value: item,
              };
            });
        })
      )
    ).asc((item) => basename(item.value.fullpath));

    task();
  } catch {
    projects.value = [];
    task({
      message: i18n.t("alert.reload-projects-failed"),
      timeout: 3000,
    });
  }

  if (notification) {
    void Toast.show({
      text: i18n.t("alert.reload-projects"),
    });
  }
}
async function importProjectFromZip(): Promise<void> {
  try {
    const names = await createProjectFromZip("projects/");
    store.commit("terminal/clear");
    void Toast.show({
      text: i18n.t("alert.imported-project", {
        list: names.map((item) => `"${item}"`).join(", "),
      }),
    });
  } catch (err) {
    store.commit("terminal/error", err);
  }
  await reloadListProjects();
}
async function remove(): Promise<void> {
  if (
    projectRemoving.value &&
    codeInput.value === `u0/${basename(projectRemoving.value.fullpath)}`
  ) {
    const task = Notify.create({
      spinner: true,
      timeout: 9999999999,
      position: "bottom-right",
      message: i18n.t("alert.removing.project", {
        name: basename(projectRemoving.value.fullpath),
      }),
    });

    try {
      await fs.rmdir(projectRemoving.value.fullpath, {
        recursive: true,
      });
      task();
      void Toast.show({
        text: i18n.t("alert.removed.project", {
          name: basename(projectRemoving.value.fullpath),
        }),
      });
    } catch {
      task({
        message: i18n.t("alert.remove.project-failed", {
          name: basename(projectRemoving.value.fullpath),
        }),
      });
      void Toast.show({
        text: i18n.t("alert.remove.project-failed", {
          name: basename(projectRemoving.value.fullpath),
        }),
      });
    }

    await reloadListProjects();
    projectRemoving.value = null;
  }
}
function clonedRepo(): void {
  statePopupGitClone.value = false;
  void reloadListProjects();
}
</script>
