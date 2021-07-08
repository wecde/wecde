<template>
  <div class="fill-width fill-height">
    <div class="navigation--toolbar grey-2" style="z-index: 2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> {{ $t("Project") }} </span>
      </div>

      <div>
        <v-btn icon @click="search = !search" :color="search ? `blue` : null">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon @click="reloadListProjects(true)">
          <v-icon>mdi-reload</v-icon>
        </v-btn>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-git</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <modal-git-clone>
              <v-list-item
                slot="activator"
                slot-scope="{ on, attr }"
                v-on="on"
                v-bind="attr"
                class="min-height-0"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-git</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ $t("Clone Repo") }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </modal-git-clone>

            <modal-git-provide>
              <v-list-item
                slot="activator"
                slot-scope="{ on, attr }"
                v-on="on"
                v-bind="attr"
                class="min-height-0"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-lock-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t("Credentials") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </modal-git-provide>
          </v-list>
        </v-menu>

        <v-menu bottom left close-on-click close-on-content-click>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <v-list-item class="min-height-0" @click="creatingProject = true">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-archive-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("New Project") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="min-height-0" @click="importProjectFromZip">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-zip-box-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Import ZIP") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-message-text-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Change Logs") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-gitlab</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("View Labs") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <app-create-project
          v-model="creatingProject"
          @created="reloadListProjects"
          :projects="projects"
        />
      </div>
    </div>

    <div class="fill-height">
      <div class="navigation--toolbar">
        <div>
          <v-btn icon>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <span class="app-title"> {{ $t("Project") }} </span>
        </div>
      </div>

      <v-text-field
        placeholder="Search"
        outline
        rounded
        class="py-1 grey-4 mx-3"
        hide-details
        close-on-click
        append-icon="mdi-close"
        v-if="search"
        v-model="keywordSearch"
      ></v-text-field>

      <div class="fill-height overflow-y-scroll">
        <v-list>
          <app-item-project
            v-for="item in projects"
            :key="item.file"
            :project="item"
            @rename="rename"
            @remove="projectRemoving = item"
            @click="$emit(`toFiles`)"
          />
        </v-list>
      </div>

      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
        content-class="dialog--remove-project"
        :value="!!projectRemoving"
        @input="$event ? (projectRemoveiing = null) : null"
      >
        <v-card dark>
          <div class="d-flex justify-space-between align-center fill-width">
            <v-card-title class="text-body-1">
              {{ $t("Delete") }} {{ $t("Project") }}
            </v-card-title>
          </div>
          <v-card-text class="pb-0">
            {{ $t("Type") }} <span class="blue--text">{{ code }}</span>
            {{ $t("to confirm.") }}
            <span class="blue--text">{{ (projectRemoving || {}).file }}</span>
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
    </div>
  </div>
</template>

<script>
import { readdirStat, rename, rmdir } from "@/modules/filesystem";
import AppItemProject from "@/components/AppItemProject";
import AppCreateProject from "@/components/AppCreateProject";
import importZip from "@/modules/import-zip";
import { random } from "@/utils";
import { Toast } from "@capacitor/toast";
import ModalGitProvide from "@/components/ModalGitProvide";
import ModalGitClone from "@/components/ModalGitClone";

export default {
  components: {
    AppItemProject,
    AppCreateProject,
    ModalGitProvide,
    ModalGitClone,
  },
  data() {
    return {
      search: false,

      projects: [],

      creatingProject: false,

      projectRemoving: null,

      code: null,
      codeInput: null,

      keywordSearch: "",
    };
  },
  watch: {
    projectRemoving(newValue) {
      if (newValue) {
        this.code = [random(9), random(9), random(9)].join("");
      } else {
        this.code = null;
      }
    },
    code() {
      this.codeInput = null;
    },
  },
  async created() {
    await this.reloadListProjects();
  },
  methods: {
    async reloadListProjects(notification = false) {
      this.$show();
      try {
        this.projects = (await readdirStat("projects"))
          .filter((project) => {
            return (
              project.file.includes("/") === false &&
              project.stat.type === "directory"
            );
          })
          .sort((a, b) => {
            return b.stat.mtime - a.stat.mtime;
          });
      } catch {
        this.projects = [];
      }
      this.$hide();
      if (notification) {
        await Toast.show({
          text: "Reload list projects",
        });
      }
    },
    async rename([newValue, oldValue]) {
      this.$show();
      console.log(`Rename project "${newValue}" to "${oldValue}"`);
      await rename(`projects/${newValue}`, `projects/${oldValue}`);
      await this.reloadListProjects();
      this.$hide();

      await Toast.show({
        text: this.$t(`Renamed project {old} to {new}`, {
          old: oldValue,
          new: newValue,
        }),
      });
    },
    async importProjectFromZip() {
      try {
        const names = await importZip(`projects/`);
        this.$store.commit("terminal/clear");
        Toast.show({
          text: this.$t(`Imported project {list}`, {
            list: names.map((item) => `"${item}"`).join(", "),
          }),
        });
      } catch (err) {
        this.$store.commit("terminal/error", err);
      }
      await this.reloadListProjects();
    },
    async remove() {
      this.$show();
      if (this.code === this.codeInput) {
        await rmdir(`projects/${this.projectRemoving.file}`);
        await Toast.show({
          text: this.$t(`Removed project {name}`, {
            name: this.projectRemoving.file,
          }),
        });

        await this.reloadListProjects();
        this.projectRemoving = null;
      }
      this.$hide();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>

<style lang="scss">
.dialog--remove-project {
  height: 100%;
  box-shadow: none;
  > *:first-child {
    box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%),
      0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
  }
}
</style>
