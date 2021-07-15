<template>
  <v-list-item
    class="list-project__item"
    @click="$store.commit(`editor/setProject`, project.fullpath)"
  >
    <v-list-item-avatar size="40px">
      <svg
        id="image1"
        class="uk-margin-small-right"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          fill="#e8c4ba"
          d="M20 4L20 12L16 12ZM28 12L20 12L20 8ZM20 36L20 28L24 28ZM12 28L20 28L20 32ZM12 12L12 20L8 20ZM36 20L28 20L28 16ZM28 28L28 20L32 20ZM4 20L12 20L12 24Z"
        ></path>
        <path
          fill="#a85238"
          d="M8 4L12 8L8 12L4 8ZM36 8L32 12L28 8L32 4ZM32 36L28 32L32 28L36 32ZM4 32L8 28L12 32L8 36Z"
        ></path>
        <path
          fill="#d18a75"
          d="M20 12L20 18L16 12ZM28 20L22 20L28 16ZM20 28L20 22L24 28ZM12 20L18 20L12 24Z"
        ></path>
      </svg>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title>
        <FileExplorer-Rename
          :renaming.sync="renaming"
          :is-folder="true"
          :names-exists="namesExists"
          dirname="projects"
          v-model="project.name"
          no-icon
          allow-update-store
          :allow-rename="true"
        />
      </v-list-item-title>
      <v-list-item-subtitle style="font-size: 12px">
        {{ $t("Modified") }}
        <vue-timeagojs :time="new Date(project.stat.mtime)" />
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <v-menu internal-activator bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list color="grey-4" class="list--mouseright">
          <v-list-item class="min-height-0" @click="exportZip">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>mdi-archive-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Export ZIP") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0" @click="renaming = true" v-ripple>
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>mdi-pen</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Rename") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>mdi-export-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Move to") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0" @click="$emit(`click:delete`)">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>mdi-delete-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Delete") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";
import FileExplorerRename from "../File Explorer/Rename.vue";
import exportZip from "@/modules/export-zip";
import { Toast } from "@capacitor/toast";
import type { ReaddirStatItem } from "@/modules/filesystem";

export default defineComponent({
  components: {
    FileExplorerRename,
  },
  props: {
    project: {
      type: Object as PropType<ReaddirStatItem>,
      required: true,
    },
    namesExists: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup() {
    return {
      renaming: ref<boolean>(false),
    };
  },
  methods: {
    async exportZip() {
      try {
        await exportZip(this.project.fullpath);
        this.$store.commit("terminal/clear");

        Toast.show({
          text: this.$t("Exported {type} {name}", {
            type: this.$t("project"),
            name: this.project.name,
          }) as string,
        });
      } catch (err) {
        this.$store.commit("terminal/error", err);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
