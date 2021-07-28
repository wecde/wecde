<template>
  <v-list-item
    class="list-project__item"
    @click="$store.commit(`editor/setProject`, project.fullpath)"
  >
    <v-list-item-avatar size="40px">
      <img
        :src="
          require(`@/assets/extensions/material-icon-theme/icons/${
            pathEquals(project.fullpath, $store.state.editor.project)
              ? 'folder-project-open.svg'
              : 'folder-project.svg'
          }`)
        "
      />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title>
        <FileExplorer-Rename
          :renaming.sync="renaming"
          :is-folder="true"
          :names-exists="namesExists"
          dirname="projects"
          v-model="project.fullpath"
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

    <v-list-item-action class="ml-0">
      <v-menu internal-activator bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon>{{ mdiDotsVertical }}</v-icon>
          </v-btn>
        </template>

        <v-list color="grey-4" class="list--mouseright">
          <v-list-item class="min-height-0" @click="exportZip">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiArchiveOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Export ZIP") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0" @click="renaming = true" v-ripple>
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiPen }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Rename") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiExportVariant }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t("Move to") }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="min-height-0" @click="$emit(`click:delete`)">
            <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
              <v-icon>{{ mdiDeleteOutline }}</v-icon>
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
import { basename } from "path";
import { pathEquals } from "@/utils";
import {
  mdiDotsVertical,
  mdiArchiveOutline,
  mdiPen,
  mdiExportVariant,
  mdiDeleteOutline,
} from "@mdi/js";

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
      mdiDotsVertical,
      mdiArchiveOutline,
      mdiPen,
      mdiExportVariant,
      mdiDeleteOutline,

      renaming: ref<boolean>(false),
    };
  },
  methods: {
    pathEquals,
    async exportZip() {
      try {
        await exportZip(this.project.fullpath);
        this.$store.commit("terminal/clear");

        Toast.show({
          text: this.$t("Exported {type} {name}", {
            type: this.$t("project"),
            name: basename(this.project.fullpath),
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

.list-project__item {
  &::v-deep {
    .v-list-item__content,
    .v-list-item__title {
      overflow: visible !important;
    }
  }
}
</style>
