<template>
  <Template-Tab>
    <template v-slot:title>{{ projectName }}</template>

    <template v-slot:addons>
      <q-btn
        :icon="mdiReload"
        @click="reloadListFile(true)"
        flat
        round
        padding="xs"
        size="13px"
      />
      <q-btn
        :icon="mdiPlus"
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
            <template v-if="clipboardExists">
              <q-item
                clickable
                v-close-popup
                v-ripple
                @click="paste"
                :disable="notAllowPaste"
              >
                <q-item-section avatar class="min-width-0">
                  <q-icon :name="mdiContentPaste" />
                </q-item-section>
                <q-item-section>{{ $t("label.paste") }}</q-item-section>
              </q-item>
              <q-separator />
            </template>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="
                adding = true;
                addingFolder = false;
              "
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiFileOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-file") }}</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              @click="
                adding = true;
                addingFolder = true;
              "
            >
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiFolderOutline" />
              </q-item-section>
              <q-item-section>{{ $t("label.new-folder") }}</q-item-section>
            </q-item>

            <Action-Import-Files
              :dirname="$store.state.editor.project"
              @imported="reloadListFile"
              v-if="$store.state.editor.project"
            >
              <template v-slot:default="{ on }">
                <q-item clickable v-close-popup v-ripple @click="on">
                  <q-item-section avatar class="min-width-0">
                    <q-icon :name="mdiDownload" />
                  </q-item-section>
                  <q-item-section>{{
                    $t("label.import-files")
                  }}</q-item-section>
                </q-item>
              </template>
            </Action-Import-Files>

            <q-separator />

            <q-item clickable v-close-popup v-ripple>
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiUndo" />
              </q-item-section>
              <q-item-section>{{ $t("label.undo") }}</q-item-section>
            </q-item>

            <q-item clickable v-close-popup v-ripple>
              <q-item-section avatar class="min-width-0">
                <q-icon :name="mdiRedo" />
              </q-item-section>
              <q-item-section>{{ $t("label.redo") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>

    <template v-slot:contents v-if="$store.state.editor.project">
      <div>
        <FileExplorer-Add
          v-model:adding="adding"
          :is-folder="addingFolder"
          :names-exists="tree.map((item) => basename(item.fullpath))"
          :dirname="$store.state.editor.project"
          allow-open-editor
          @created="reloadListFile"
        />

        <FileExplorer-List
          :files-list="tree"
          @remove-children="tree.splice($event, 1)"
          @request:refresh="reloadListFile"
        />
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import { Toast } from "@capacitor/toast";
import {
  mdiChevronDown,
  mdiClose,
  mdiContentPaste,
  mdiDownload,
  mdiFileOutline,
  mdiFolderOutline,
  mdiPlus,
  mdiRedo,
  mdiReload,
  mdiUndo,
} from "@quasar/extras/mdi-v5";
import ActionImportFiles from "components/Action-ImportFiles.vue";
import FileExplorerAdd from "components/File Explorer/Add.vue";
import FileExplorerList from "components/File Explorer/List.vue";
import { readdirAndStat } from "modules/filesystem";
import type { StatItem } from "modules/filesystem";
import { basename } from "path-cross";
import { useStore } from "src/store";
import { computed, defineComponent, ref } from "vue";

import TemplateTab from "./template/Tab.vue";

export default defineComponent({
  components: {
    TemplateTab,
    FileExplorerList,
    FileExplorerAdd,
    ActionImportFiles,
  },
  setup() {
    const store = useStore();
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const tree = ref<StatItem[]>([]);
    const project = computed<string | null>(() => store.state.editor.project);
    const projectName = computed<string | null>(() =>
      project.value ? basename(project.value) : null
    );

    return {
      mdiReload,
      mdiPlus,
      mdiContentPaste,
      mdiFileOutline,
      mdiFolderOutline,
      mdiDownload,
      mdiUndo,
      mdiRedo,
      mdiChevronDown,
      mdiClose,

      adding,
      addingFolder,
      tree,
      projectName,
    };
  },
  watch: {
    "$store.state.editor.project": {
      async handler() {
        this.tree.splice(0);
        await this.reloadListFile();
      },
      immediate: true,
    },
  },
  methods: {
    basename,

    async reloadListFile(notification = false): Promise<void> {
      try {
        if (!this.$store.state.editor.project) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("IS_NOT_DIR");
        }

        this.tree = [
          ...(await readdirAndStat(this.$store.state.editor.project)),
        ];

        if (notification) {
          void Toast.show({
            text: this.$t("alert.reload-files"),
          });
        }
      } catch (err) {
        console.log(err);
        this.tree = [];
      }
    },

    async paste() {
      await this.$store.dispatch(
        "clipboard-fs/paste",
        this.$store.state.editor.project
      );

      await this.reloadListFile();
    },
  },
  computed: {
    clipboardExists(): boolean {
      return this.$store.getters["clipboard-fs/isEmpty"] === false;
    },
    notAllowPaste(): boolean {
      return (
        this.$store.getters["clipboard-fs/allowPaste"](
          this.$store.state.editor.project
        ) === false
      );
    },
  },
});
</script>
