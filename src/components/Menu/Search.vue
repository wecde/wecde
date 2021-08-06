<template>
  <Template-Tab>
    <template v-slot:title>{{ $t("Find") }}</template>

    <template v-slot:addons>
      <q-btn
        flat
        round
        padding="none"
        size="1em"
        class="q-ml-xs"
        :icon="mdiRegex"
        :color="modeRegexp ? `blue` : undefined"
        @click="modeRegexp = !modeRegexp"
      />
      <q-btn
        flat
        round
        padding="none"
        size="1em"
        class="q-ml-xs"
        :icon="mdiFormatLetterCase"
        :color="modeLetterCase ? `blue` : undefined"
        @click="modeLetterCase = !modeLetterCase"
      />
      <q-btn
        flat
        round
        padding="none"
        size="1em"
        class="q-ml-xs"
        :icon="mdiFileWordBoxOutline"
        :color="modeWordBox ? `blue` : undefined"
        @click="modeWordBox = !modeWordBox"
      />
    </template>

    <template v-slot:contents>
      <div class="flex no-wrap items-center justify-between">
        <q-icon
          size="20px"
          @click="openReplace = !openReplace"
          :name="openReplace ? mdiChevronDown : mdiChevronRight"
        />
        <div class="full-width">
          <q-input
            :placeholder="$t('Search')"
            rounded
            dense
            outlined
            v-model="keywordSearch"
            @keypress.enter="search"
          />
          <q-input
            :placeholder="$t('Replace')"
            rounded
            dense
            outlined
            class="q-mt-1"
            v-model="keywordReplace"
            v-show="openReplace"
          >
            <template v-slot:append>
              <q-icon
                @click="replaceAll"
                v-ripple="false"
                :name="mdiFileReplaceOutline"
                size="0.85em"
              />
            </template>
          </q-input>
        </div>
      </div>
      <div class="text-right">
        <q-icon
          size="20px"
          @click="openRules = !openRules"
          :name="mdiDotsHorizontal"
        />
        <div class="text-left" v-show="openRules">
          <small class="text-caption">{{ $t("files to include") }}</small>
          <q-input
            rounded
            dense
            outlined
            v-model="include"
            placeholder="(e.g *.ts, src/**/include)"
          />

          <small class="text-caption q-mt-1">{{
            $t("files to exclude")
          }}</small>
          <q-input
            rounded
            dense
            outlined
            v-model="exclude"
            placeholder="(e.g *.ts, src/**/exclude)"
          />
        </div>
      </div>

      <div style="position: relative">
        <q-linear-progress
          indeterminate
          color="cyan"
          size="2px"
          rounded
          style="position: absolute; top: 0"
          v-if="searching"
        />

        <App-Collapse
          v-for="item in results"
          :key="item.file"
          :eager="true"
          content-class="q-ml-4"
        >
          <template v-slot:activator="{ state, on }">
            <div class="file-object" v-on="on" v-ripple>
              <q-icon
                size="20px"
                :name="state ? mdiChevronDown : mdiChevronRight"
              />
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
                <span class="chip blue">{{ item.match.length }}</span>
              </div>
            </div>
          </template>

          <div
            class="flex items-center justify-between"
            v-for="(match, index) in item.match"
            :key="match.index"
            v-ripple
            @click="
              gotoEditor(
                item.file,
                match.index,
                match.index + match.value.length
              )
            "
          >
            <div class="text-truncate" style="font-size: 15px">
              {{ match.firstValue
              }}<strong class="blue--text">{{ match.value }}</strong
              >{{ match.lastValue }}
            </div>

            <q-icon
              size="1em"
              @click.prevent.stop="replaceSearch(item, index)"
              :name="mdiCheck"
            />
          </div>
        </App-Collapse>
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import {
  mdiCheck,
  mdiChevronDown,
  mdiChevronRight,
  mdiDotsHorizontal,
  mdiFileReplaceOutline,
  mdiFileWordBoxOutline,
  mdiFormatLetterCase,
  mdiRegex,
} from "@quasar/extras/mdi-v5";
import escapeRegExp from "escape-string-regexp";
import { basename, join } from "path-cross";
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon";
import AppCollapse from "src/components/App/Collapse.vue";
import {
  foreach as foreachFiles,
  readFile,
  writeFile,
} from "src/modules/filesystem";
import { useStore } from "src/store";
import { createTimeoutBy, isPlainText, rawText } from "src/utils";
import { defineComponent, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

interface Result {
  file: string;
  basename: string;
  match: {
    index: number;
    firstValue: string;
    value: string;
    lastValue: string;
  }[];
}

export default defineComponent({
  components: {
    TemplateTab,
    AppCollapse,
  },
  setup() {
    const store = useStore();
    const modeRegexp = ref<boolean>(false);
    const modeLetterCase = ref<boolean>(false);
    const modeWordBox = ref<boolean>(false);

    const searching = ref<boolean>(false);
    const results = ref<Result[]>([]);

    const keywordSearch = ref<string>("");
    const keywordReplace = ref<string>("");
    const include = ref<string>("");
    const exclude = ref<string>("");

    const OFFSET_RESULT_SEARCH = 15;
    async function searchInFile(file: string): Promise<Result | void> {
      if (isPlainText(file)) {
        const regexp = new RegExp(
          `(?:(${
            modeRegexp.value
              ? keywordSearch.value
              : escapeRegExp(keywordSearch.value)
          })${modeWordBox.value ? "\\s|$" : ""}){1}?`,
          "g" + (modeLetterCase.value ? "" : "i")
        );
        const textContentFile = rawText(await readFile(file));
        const rawMatch = textContentFile.matchAll(regexp);

        if (rawMatch) {
          const match = [...(rawMatch || [])].map((item) => {
            const indexSearch = item.index || 0;
            const indexNewlineBeforeSearch = textContentFile.lastIndexOf(
              "\n",
              indexSearch - 1
            );
            const indexNewLineAfterSearch = textContentFile.indexOf(
              "\n",
              indexSearch + 1 + item[1].length
            );

            const distIndexNewlineBeforeSearch =
              indexSearch - indexNewlineBeforeSearch;
            const distIndexNewlineAfterSearch =
              indexNewLineAfterSearch - (indexSearch + item[0].length);

            return {
              index: indexSearch,
              firstValue: textContentFile.substring(
                distIndexNewlineBeforeSearch < OFFSET_RESULT_SEARCH &&
                  indexNewlineBeforeSearch !== -1
                  ? indexNewlineBeforeSearch
                  : indexSearch - OFFSET_RESULT_SEARCH,
                indexSearch
              ),
              value: item[1],
              lastValue: textContentFile.substring(
                indexSearch + item[1].length,
                distIndexNewlineAfterSearch < OFFSET_RESULT_SEARCH &&
                  indexNewLineAfterSearch !== -1
                  ? indexNewLineAfterSearch
                  : indexSearch + item[1].length + OFFSET_RESULT_SEARCH
              ),
            };
          });

          if (match.length > 0) {
            return {
              file,
              basename: basename(file),
              match,
            };
          }
        }
      }
    }

    function search(): void {
      createTimeoutBy(
        "menu.search.timeout-search",
        async (): Promise<void> => {
          results.value.splice(0);

          searching.value = true;
          if (store.state.editor.project && !!keywordSearch.value) {
            await foreachFiles(
              store.state.editor.project,
              [
                "^.git",
                ...exclude.value
                  .replace(/(?:\s)+,(?:\s)+/g, ",")
                  .split(",")
                  .filter(Boolean),
              ],
              [
                ...include.value
                  .replace(/(?:\s)+,(?:\s)+/g, ",")
                  .split(",")
                  .filter(Boolean),
              ],
              async (dirname: string, filename: string): Promise<void> => {
                const file = join(dirname, filename);

                const result = await searchInFile(file);

                if (result) {
                  results.value.push(result);
                }
              }
            );
          }
          searching.value = false;
        },
        500
      );
    }

    watch(modeRegexp, () => void search());
    watch(modeLetterCase, () => void search());
    watch(modeWordBox, () => void search());
    // watch(keywordSearch, () => void search());

    return {
      mdiChevronDown,
      mdiRegex,
      mdiFormatLetterCase,
      mdiFileWordBoxOutline,
      mdiChevronRight,
      mdiFileReplaceOutline,
      mdiDotsHorizontal,
      mdiCheck,

      modeRegexp,
      modeLetterCase,
      modeWordBox,

      search,

      openReplace: ref<boolean>(false),
      openRules: ref<boolean>(false),

      searching,
      searchInFile,
      results,

      keywordSearch,
      keywordReplace,
      include,
      exclude,
    };
  },
  methods: {
    getIcon,

    async replaceSearch(item: Result, matchIndex: number): Promise<void> {
      this.$store.commit("system/setProgress", true);
      const { file } = item;
      const context = rawText(await readFile(file));
      const { index, value } = item.match[matchIndex];

      // eslint-disable-next-line functional/no-let
      let newContext =
        context.slice(0, index) +
        (this.modeRegexp
          ? value.replace(new RegExp(this.keywordSearch), this.keywordReplace)
          : this.keywordReplace) +
        context.slice(index + value.length);

      await writeFile(file, newContext);

      const newResult = await this.searchInFile(file);

      if (newResult) {
        const index = this.results.indexOf(item);
        this.results.splice(index, 1, newResult);
      } else {
        this.results.splice(this.results.indexOf(item), 1);
      }
      this.$store.commit("system/setProgress", false);
    },

    async replaceAll(): Promise<void> {
      // eslint-disable-next-line functional/no-loop-statement
      for (const item of this.results) {
        // eslint-disable-next-line functional/no-loop-statement
        for (const index in item.match) {
          await this.replaceSearch(item, +index);
        }
      }
    },

    gotoEditor(file: string, start: number, stop: number): void {
      void this.$router.push({
        name: "editor",
        query: {
          selection: `${start}->${stop}`,
        },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import "src/components/File Explorer/ListItem.scss";
@import "src/components/File Explorer/Rename.scss";

.file-object {
  @include file-object($enable-git: false);
  padding: {
    left: 0;
    right: 0;
  }
}
.icon-file {
  @include icon-file();
}
</style>
