<template>
  <div class="fill-width">
    <div class="navigation--toolbar grey-2" style="z-index: 2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> Project </span>
      </div>

      <div>
        <v-btn icon @click="search = !search" :color="search ? `blue` : null">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-reload</v-icon>
        </v-btn>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-git</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-git</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Clone Repo </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-lock-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Credentials </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-archive-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> New Project </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-zip-box-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Import ZIP </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-message-text-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> Change Logs </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-gitlab</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> View Labs </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <div>
      <div class="navigation--toolbar">
        <div>
          <v-btn icon>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <span class="app-title"> Project </span>
        </div>
      </div>

      <app-field v-show="search" class="mx-0" />

      <v-list>
        <app-item-project
          v-for="item in projects"
          :key="item.file"
          :project="item"
          @rename="rename"
        />
      </v-list>
    </div>
  </div>
</template>

<script>
import AppField from "@/components/AppField";
import { readdirStat, rename } from "@/modules/filesystem";
import AppItemProject from "@/components/AppItemProject";

export default {
  components: {
    AppField,
    AppItemProject,
  },
  data() {
    return {
      search: false,

      projects: [],
    };
  },
  async created() {
    await this.reloadListProjects();
  },
  methods: {
    async reloadListProjects() {
      this.projects = (await readdirStat("projects")).filter((project) => {
        return (
          project.file.includes("/") === false &&
          project.stat.type === "directory"
        );
      });
    },
    async rename([newValue, oldValue]) {
      console.log(`Rename project "${newValue}" to "${oldValue}"`);
      await rename(`projects/${newValue}`, `projects/${oldValue}`);
      await this.reloadListProjects();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
