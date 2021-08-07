<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("label.ettings") }}</template>

    <template v-slot:contents>
      <template v-if="$store.state['git-project'].state === 'unready'">
        The folder curently open donesn't have a git repository. You can
        initialize a repository which will enable source control features
        powered by git.

        <q-btn
          class="full-width q-mt-5"
          color="positive"
          dense
          no-caps
          @click="initRepo"
          >Initialize Repository</q-btn
        >
      </template>

      <template v-else>
        <div
          class="file-object"
          v-ripple
          v-for="item in results"
          :key="item.file"
        >
          <img
            class="icon-file"
            :src="
              getIcon({
                light: false,
                isOpen: false,
                isFolder: false,
                name: item.basename,
              })
            "
          />

          <div class="full-width text-truncate">
            {{ item.basename }}
            <small class="text-caption" style="opacity: 0.8">{{
              item.file
            }}</small>
          </div>
        </div>
      </template>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiClose,
} from "@quasar/extras/mdi-v5";
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon";
import { init as GitInit } from "src/modules/git";
import { defineComponent } from "vue";

import TemplateTab from "./template/Tab.vue";

export default defineComponent({
  components: {
    TemplateTab,
  },
  setup() {
    return {
      mdiChevronDown,
      mdiChevronRight,
      mdiClose,

      getIcon,

      results: [
        {
          file: "index.js",
          basename: "index.js",
        },
      ],
    };
  },
  methods: {
    async initRepo(): Promise<void> {
      this.$store.commit("system/setProgress", true);
      if (this.$store.state.editor.project) {
        await GitInit(this.$store.state.editor.project);
      }
      this.$store.commit("system/setProgress", false);
    },
  },
});
</script>
