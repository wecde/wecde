<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("Project") }}</template>

    <template v-slot:addons>
      <v-btn icon @click="reloadListProjects(true)">
        <v-icon>{{ mdiReload }}</v-icon>
      </v-btn>

      <v-menu
        internal-activator
        bottom
        left
        close-on-click
        close-on-content-click
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>{{ mdiGit }}</v-icon>
          </v-btn>
        </template>

        <template v-slot="menu">
          <v-list color="grey-4">
            <Git-Clone
              @done="
                menu.value = false;
                reloadListProjects();
              "
            >
              <v-list-item
                slot="activator"
                slot-scope="{ on, attr }"
                v-on="on"
                v-bind="attr"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiGit }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ $t("Clone Repo") }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </Git-Clone>

            <Git-Provide>
              <v-list-item
                slot="activator"
                slot-scope="{ on, attr }"
                v-on="on"
                v-bind="attr"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>{{ mdiLockOutline }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t("Credentials") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </Git-Provide>
          </v-list>
        </template>
      </v-menu>

      <v-menu bottom left close-on-click close-on-content-click>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>{{ mdiPlus }}</v-icon>
          </v-btn>
        </template>

        <v-list color="grey-4">
          <v-list-item @click="creatingProject = true">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiArchiveOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("New Project") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="importProjectFromZip">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiZipBoxOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Import ZIP") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item @click="$router.push(`/?tab=1`)">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiMessageTextOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Change Logs") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="$router.push(`/`)">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiCubeOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("View Labs") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <Project-Create
        v-model="creatingProject"
        @created="reloadListProjects"
        :names-exists="projects.map((item) => basename(item.fullpath))"
      />
    </template>

    <template v-slot:contents>
      <v-list color="transparent">
        <Project-Item
          v-for="item in projects"
          :key="item.fullpath"
          :project="item"
          :names-exists="projects.map((item) => basename(item.fullpath))"
          @click:delete="projectRemoving = item"
          @click.native="$emit(`toFiles`)"
        />
      </v-list>
    </template>

    <template v-slot:others>
      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
        content-class="dialog--remove-project"
        :value="!!projectRemoving"
        @input="$event ? (projectRemoveiing = null) : null"
      >
        <v-card dark v-if="projectRemoving">
          <div class="d-flex justify-space-between align-center fill-width">
            <v-card-title class="text-body-1">
              {{ $t("Delete") }} {{ $t("Project") }}
            </v-card-title>
          </div>
          <v-card-text class="pb-0">
            {{ $t("Type") }} <span class="blue--text">{{ code }}</span>
            {{ $t("to confirm.") }}
            <span class="blue--text">{{
              basename(projectRemoving.fullpath)
            }}</span>
            {{ $t("will permanently deleted. It can NOT be recovered!") }}
            <v-text-field
              :rules="[
                () =>
                  code === codeInput
                    ? true
                    : $t('What you typed did not match {code}', { code }),
              ]"
              class="pt-0 mt-3"
              type="tel"
              required
              v-model="codeInput"
              @keypress.enter="remove"
            />
          </v-card-text>

          <div class="d-flex align-center justify-space-between mt-3">
            <v-btn text color="blue" @click="projectRemoving = null">
              {{ $t("Cancel") }}
            </v-btn>
            <v-btn text color="blue" @click="remove"> {{ $t("OK") }} </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "@vue/composition-api";
import TemplateTab from "./template/Tab.vue";
import { readdirStat, rmdir } from "@/modules/filesystem";
import type { ReaddirStatItem } from "@/modules/filesystem";
import ProjectItem from "@/components/Project/Item.vue";
import ProjectCreate from "@/components/Project/Create.vue";
import importZip from "@/modules/import-zip";
import { random } from "@/utils";
import { Toast } from "@capacitor/toast";
import GitProvide from "@/components/Git/ModalGitProvide.vue";
import GitClone from "@/components/Git/ModalGitClone.vue";
import { basename } from "path";
import {
  mdiReload,
  mdiGit,
  mdiLockOutline,
  mdiPlus,
  mdiArchiveOutline,
  mdiZipBoxOutline,
  mdiMessageTextOutline,
  mdiCubeOutline,
  mdiClose,
} from "@mdi/js";

export default defineComponent({
  components: {
    TemplateTab,
    ProjectItem,
    ProjectCreate,
    GitProvide,
    GitClone,
  },
  setup() {
    const projects = ref<ReaddirStatItem[]>([]);
    const creatingProject = ref<boolean>(false);
    const projectRemoving = ref<null | ReaddirStatItem>(null);
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
        await Toast.show({
          text: this.$t("Reload list {type}", {
            type: this.$t("project"),
          }) as string,
        });
      }
    },
    async importProjectFromZip(): Promise<void> {
      try {
        const names = await importZip(`projects/`);
        this.$store.commit("terminal/clear");
        Toast.show({
          text: this.$t(`Imported {type} {list}`, {
            type: this.$t("project(s)"),
            list: names.map((item) => `"${item}"`).join(", "),
          }) as string,
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
          Toast.show({
            text: this.$t(`Removed {type} {name}`, {
              type: this.$t("project"),
              name: basename(this.projectRemoving.fullpath),
            }) as string,
          });
        } catch {
          Toast.show({
            text: this.$t(`Remove {type} {name} failed`, {
              type: this.$t("project"),
              name: basename(this.projectRemoving.fullpath),
            }) as string,
          });
        }

        await this.reloadListProjects();
        this.projectRemoving = null;
      }
      this.$store.commit("system/setProgress", false);
    },
  },
});
</script>
