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
            :names-exists="projects.map((item) => basename(item.fullpath))"
          />
        </q-pull-to-refresh>
      </q-list>
    </template>
  </Template-Tab>

  <Free-Component :active="stateClone">
    <template v-slot="{ on }">
      <Clone v-model="stateClone" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="stateProvide">
    <template v-slot="{ on }">
      <Provide v-model="stateProvide" v-on="on" />
    </template>
  </Free-Component>
  <Free-Component :active="stateCreate">
    <template v-slot="{ on }">
      <Create
        v-model="stateCreate"
        :names-exists="projects.map((item) => basename(item.fullpath))"
        v-on="on"
      />
    </template>
  </Free-Component>
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import FreeComponent from "components/FreeComponent.vue";
import Clone from "components/Git/Clone.vue";
import Provide from "components/Git/Provide.vue";
import Create from "components/Project/Create.vue";
import Item from "components/Project/Item.vue";
import { sort } from "fast-sort";
import fs from "modules/fs";
import { basename } from "path-cross";
import { Notify } from "quasar";
import { readdirAndStat, registerWatch, StatItem } from "src/helpers/fs-helper";
import { useCreateProjectFromZip } from "src/helpers/useCreateProjectFromZip";
import { useStore } from "src/store";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import TemplateTab from "./template/Tab.vue";

const i18n = useI18n();
const store = useStore();

const createProjectFromZip = useCreateProjectFromZip();

const projects = reactive<StatItem[]>([]);
const stateCreate = ref<boolean>(false);
const stateClone = ref<boolean>(false);
const stateProvide = ref<boolean>(false);

void reloadListProjects();

async function reloadListProjects(notification = false): Promise<void> {
  const task = Notify.create({
    group: false,
    spinner: true,
    type: "ongoing",
    timeout: 0,
    position: "bottom-right",
    message: i18n.t("alert.reload.project"),
    caption: "/projects/*",
  });

  try {
    // eslint-disable-next-line functional/immutable-data
    projects.splice(0);
    // eslint-disable-next-line functional/immutable-data
    projects.push(
      ...sort(
        await Promise.all(
          await readdirAndStat("projects").then((item) => {
            return item.filter((project) => project.stat.type === "directory");
          })
        )
      ).asc((item) => basename(item.fullpath))
    );

    task();
  } catch (e) {
    if (e?.code !== "ENOENT") {
      console.log(e);
      // eslint-disable-next-line functional/immutable-data
      projects.splice(0);
      task({
        message: i18n.t("alert.failure.reload.project"),
        type: "negative",
        timeout: 1000,
        spinner: false,
        caption: "/projects/*",
      });
    } else {
      task();
    }
  }

  if (notification) {
    void Toast.show({
      text: i18n.t("alert.reload.project"),
    });
  }
}
async function importZip(): Promise<void> {
  try {
    const names = await createProjectFromZip("projects/");
    store.commit("terminal/clear");
    void Toast.show({
      text: i18n.t("alert.imported.project(s)", {
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
    if (projects.some(({ fullpath }) => fs.isEqual(fullpath, path)) === false) {
      try {
        const value: StatItem = {
          stat: await fs.stat(path),
          fullpath: path,
        };

        // eslint-disable-next-line functional/immutable-data
        projects.push(
          // eslint-disable-next-line functional/immutable-data
          ...sort([...projects.splice(0), value]).asc((item) =>
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
    if (projects.some(({ fullpath }) => fs.isEqual(fullpath, path))) {
      // eslint-disable-next-line functional/immutable-data
      projects.push(
        ...sort(
          // eslint-disable-next-line functional/immutable-data
          projects
            .splice(0)
            .filter(({ fullpath }) => fs.isEqual(fullpath, path) === false)
        ).asc((item) => basename(item.fullpath))
      );
    }
  },
  {
    type: "remove:dir",
  }
);
</script>
