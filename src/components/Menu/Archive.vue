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
              @click="stateClone = true"
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
              @click="stateProvide = true"
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
              @click="stateCreate = true"
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
              @click="importZip"
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
          <Item
            v-for="item in projects"
            :key="item.fullpath"
            :project="item"
            :names-exists="
              projects.map((item) => basename(item.fullpath))
            "
          />
        </q-pull-to-refresh>
      </q-list>
    </template>
  </Template-Tab>

  <Clone v-model="stateClone" />
  <Provide v-model="stateProvide" />
  <Create
    v-model="stateCreate"
    :names-exists="projects.map((item) => basename(item.value.fullpath))"
  />
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import Create from "components/Project/Create.vue";
import Item from "components/Project/Item.vue";
import { sort } from "fast-sort";
import fs from "modules/fs";
import { basename } from "path-cross";
import { Notify } from "quasar";
import Clone from "src/components/Git/Clone.vue";
import Provide from "src/components/Git/Provide.vue";
import createProjectFromZip from "src/helpers/createProjectFromZip";
import { readdirAndStat, registerWatch, StatItem } from "src/helpers/fs";
import { useStore } from "src/store";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import TemplateTab from "./template/Tab.vue";

const i18n = useI18n();
const store = useStore();

const projects = ref<StatItem[]>([]);
const stateCreate = ref<boolean>(false);
const stateClone = ref<boolean>(false);
const stateProvide = ref<boolean>(false);

void reloadListProjects();

async function reloadListProjects(notification = false): Promise<void> {
  const task = Notify.create({
    spinner: true,
    timeout: 9999999999,
    position: "bottom-right",
    message: i18n.t("alert.reload-projects"),
  });

  try {
    projects.value.splice(0);
    projects.value.push(
      ...sort(
        await Promise.all(
          await readdirAndStat("projects").then((item) => {
            return item.filter((project) => project.stat.type === "directory");
          })
        )
      ).asc((item) => basename(item.fullpath))
    );

    task();
  } catch {
    projects.value.splice(0);
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
async function importZip(): Promise<void> {
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
}

registerWatch(
  "projects/*",
  async ({ path }) => {
    // fork
    // add folder;
    // is exists
    if (
      projects.value.some(({ fullpath }) => fs.isEqual(fullpath, path)) ===
      false
    ) {
      try {
        const value: StatItem = {
          stat: await fs.stat(path),
          fullpath: path,
        };

        projects.value.splice(0);
        projects.value.push(
          ...sort([...projects.value, value]).asc((item) =>
            basename(item.fullpath)
          )
        );
        // our -> clone;
      } catch {}
    }
  },
  {
    type: "create:dir",
  }
);
registerWatch(
  "projects/*",
  ({ path }) => {
    if (projects.value.some(({ fullpath }) => fs.isEqual(fullpath, path))) {
      projects.value.splice(0);
      projects.value.push(
        ...sort(
          projects.value.filter(
            ({ fullpath }) => fs.isEqual(fullpath, path) === false
          )
        ).asc((item) => basename(item.fullpath))
      );
    }
  },
  {
    type: "remove:dir",
  }
);
</script>
