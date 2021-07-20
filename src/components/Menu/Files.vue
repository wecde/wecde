<template>
  <div class="fill-width fill-height">
    <div
      class="
        navigation--toolbar
        grey-2
        d-flex
        align-center
        justify-space-between
        fill-width
      "
    >
      <div class="d-flex align-center justify-space-between order-1">
        <v-btn icon @click="search = !search" :color="search ? `blue` : null">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon @click="reloadListFile(true)">
          <v-icon>mdi-reload</v-icon>
        </v-btn>

        <v-menu internal-activator bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>

          <v-list color="grey-4" class="list--mouseright">
            <template v-if="clipboardExists">
              <v-list-item
                class="min-height-0"
                @click="paste"
                :disabled="notAllowPaste"
              >
                <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                  <v-icon>mdi-content-paste</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title> {{ $t("Paste") }} </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider />
            </template>
            <v-list-item
              class="min-height-0"
              @click="
                adding = true;
                addingFolder = false;
              "
            >
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-file-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("New File") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              class="min-height-0"
              @click="
                adding = true;
                addingFolder = true;
              "
            >
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-folder-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("New Folder") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <Import-Files
              :dirname="$store.state.editor.project"
              @imported="reloadListFile"
            >
              <template v-slot:default="{ on }">
                <v-list-item class="min-height-0" v-on="on">
                  <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                    <v-icon>mdi-download</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ $t("Import Files") }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </Import-Files>
            <v-divider />
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-undo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Undo") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="min-height-0">
              <v-list-item-icon size="18px" class="pr-3 mr-0 my-2">
                <v-icon>mdi-redo</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> {{ $t("Redo") }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="d-flex order-0 text-truncate">
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title text-truncate">{{ projectName }}</span>
      </div>
    </div>

    <div class="fill-height">
      <v-text-field
        placeholder="Search"
        outline
        rounded
        class="py-1 grey-4 mx-2"
        hide-details
        close-on-click
        append-icon="mdi-close"
        v-if="search"
      />
      <div
        class="fill-height overflow-y-scroll"
        style="padding-bottom: 150px"
        v-if="tree"
      >
        <FileExplorer-Add
          :adding.sync="adding"
          :is-folder="addingFolder"
          :dirname="$store.state.editor.project"
          @created="reloadListFile"
          allow-open-editor
          :names-exists="tree.map((item) => basename(item.fullpath))"
        />

        <FileExplorer-List
          :files-list="tree"
          @removed-file="tree.splice($event, 1)"
          @refresh="reloadListFile"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  // watch,
  // onBeforeMount,
} from "@vue/composition-api";
import FileExplorerList from "@/components/File Explorer/List.vue";
import FileExplorerAdd from "@/components/File Explorer/Add.vue";
import { stat, readdirStat } from "@/modules/filesystem";
import type { ReaddirStatItem } from "@/modules/filesystem";
import { Toast } from "@capacitor/toast";
import { basename } from "path";
import store from "@/store";
import ImportFiles from "@/components/Import/Files.vue";
// import { statusMatrix, has as hasGIT } from "@/modules/git";

export default defineComponent({
  components: {
    FileExplorerList,
    FileExplorerAdd,
    ImportFiles,
  },
  setup() {
    const search = ref<boolean>(false);
    const adding = ref<boolean>(false);
    const addingFolder = ref<boolean>(false);
    const tree = ref<ReaddirStatItem[]>([]);
    const project = computed<string | null>(() => store.state.editor.project);
    const projectName = computed<string | null>(() =>
      project.value ? basename(project.value) : null
    );

    // let timeoutGetStatusGit: any;
    // async function getStatusGit() {
    //   clearTimeout(timeoutGetStatusGit);
    //   if (
    //     !!project.value &&
    //     (await hasGIT({
    //       dir: project.value,
    //     }))
    //   ) {
    //     console.time();
    //     console.log(
    //       await statusMatrix({
    //         dir: project.value || "",
    //       })
    //     );
    //     console.timeEnd();
    //     timeoutGetStatusGit = setTimeout(() => void getStatusGit(), 1000);
    //   }
    // }

    // watch(project, (newValue: string | null) => {
    //   clearTimeout(timeoutGetStatusGit);
    //   // eslint-disable-next-line no-extra-boolean-cast
    //   if (!!newValue) {
    //     getStatusGit();
    //   }
    // });

    // onBeforeMount(() => clearTimeout(timeoutGetStatusGit));

    // getStatusGit();

    return {
      search,
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
        if (
          (await stat(this.$store.state.editor.project)).type !== "directory"
        ) {
          throw new Error(`IS_NOT_DIR`);
        }

        this.tree = await readdirStat(
          this.$store.state.editor.project,
          void 0,
          ["^.git"]
        );

        if (notification) {
          Toast.show({
            text: this.$t("Reload list {type}", {
              type: this.$t("file(s)"),
            }) as string,
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

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>
