<template>
  <Template-Tab no-flat contents-class="q-mt-3">
    <template v-slot:title>{{ $t("label.find") }}</template>

    <template v-slot:addons>
      <q-btn
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
        icon="mdi-regex"
        :color="modeRegexp ? `blue` : undefined"
        @click="modeRegexp = !modeRegexp"
      />
      <q-btn
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
        icon="mdi-format-letter-case"
        :color="modeLetterCase ? `blue` : undefined"
        @click="modeLetterCase = !modeLetterCase"
      />
      <q-btn
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
        icon="mdi-file-word-xox-outline"
        :color="modeWordBox ? `blue` : undefined"
        @click="modeWordBox = !modeWordBox"
      />
    </template>

    <template v-slot:contents>
      <div class="flex no-wrap items-center justify-between q-ml-n4">
        <q-icon
          size="20px"
          @click="openReplace = !openReplace"
          :name="openReplace ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        />
        <div class="full-width">
          <q-input
            :placeholder="$t('placeholder.search')"
            rounded
            dense
            outlined
            v-model="keywordSearch"
            @keypress.enter="search"
          />
          <q-input
            :placeholder="$t('placeholder.replace')"
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
                name="mdi-file-replace-outline"
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
          name="mdi-dots-horizontal"
        />
        <div class="text-left" v-show="openRules">
          <small class="text-caption">{{ $t("label.files-include") }}</small>
          <q-input
            rounded
            dense
            outlined
            v-model="include"
            placeholder="(e.g *.ts, src/**/include)"
          />

          <small class="text-caption q-mt-1">{{
            $t("label.files-exclude")
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
          v-if="loading"
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
                :name="state ? 'mdi-chevron-down' : 'mdi-chevron-right'"
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
              }}<strong class="text-blue">{{ match.value }}</strong
              >{{ match.lastValue }}
            </div>

            <q-icon
              size="13px"
              @click.prevent.stop="replaceSearch(item, index)"
              name="mdi-check"
            />
          </div>
        </App-Collapse>
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts">
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import AppCollapse from "components/App/Collapse.vue";
import escapeRegExp from "escape-string-regexp";
import isBinaryPath from "is-binary-path-cross";
import fs from "modules/fs";
import { basename } from "path-cross";
import { useStore } from "src/store";
import { createTimeoutBy, foreachAsync } from "src/utils";
import { defineComponent, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

interface Result {
  readonly file: string;
  readonly basename: string;
  readonly match: readonly {
    readonly index: number;
    readonly firstValue: string;
    readonly value: string;
    readonly lastValue: string;
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

    const loading = ref<boolean>(false);
    const results = ref<Result[]>([]);

    const keywordSearch = ref<string>("");
    const keywordReplace = ref<string>("");
    const include = ref<string>("");
    const exclude = ref<string>("");

    const OFFSET_RESULT_SEARCH = 15;
    async function searchInFile(file: string): Promise<Result | void> {
      if (isBinaryPath(file) === false) {
        const regexp = new RegExp(
          `(?:(${
            modeRegexp.value
              ? keywordSearch.value
              : escapeRegExp(keywordSearch.value)
          })${modeWordBox.value ? "\\s|$" : ""}){1}?`,
          "g" + (modeLetterCase.value ? "" : "i")
        );
        const textContentFile = await fs.readFile(file, "utf8");
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
        // eslint-disable-next-line @typescript-eslint/require-await
        async (): Promise<void> => {
          results.value.splice(0);

          loading.value = true;
          if (store.state.editor.project && !!keywordSearch.value) {
            // await foreachFiles(
            //   store.state.editor.project,
            //   [
            //     "^.git",
            //     ...exclude.value
            //       .replace(/(?:\s)+,(?:\s)+/g, ",")
            //       .split(",")
            //       .filter(Boolean),
            //   ],
            //   [
            //     ...include.value
            //       .replace(/(?:\s)+,(?:\s)+/g, ",")
            //       .split(",")
            //       .filter(Boolean),
            //   ],
            //   async (dirname: string, filename: string): Promise<void> => {
            //     const file = join(dirname, filename);
            //     const result = await searchInFile(file);
            //     if (result) {
            //       results.value.push(result);
            //     }
            //   }
            // );
          }
          loading.value = false;
        },
        500,
        {
          skipme: true,
        }
      );
    }

    watch(modeRegexp, () => void search());
    watch(modeLetterCase, () => void search());
    watch(modeWordBox, () => void search());
    // watch(keywordSearch, () => void search());

    return {
      modeRegexp,
      modeLetterCase,
      modeWordBox,

      search,

      openReplace: ref<boolean>(false),
      openRules: ref<boolean>(false),

      loading,
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
      this.loading = true;

      const { file } = item;
      const context = await fs.readFile(file, "utf8");
      const { index, value } = item.match[matchIndex];

      // eslint-disable-next-line functional/no-let
      let newContext =
        context.slice(0, index) +
        (this.modeRegexp
          ? value.replace(new RegExp(this.keywordSearch), this.keywordReplace)
          : this.keywordReplace) +
        context.slice(index + value.length);

      await fs.writeFile(file, newContext);

      const newResult = await this.searchInFile(file);

      if (newResult) {
        const index = this.results.indexOf(item);
        this.results.splice(index, 1, newResult);
      } else {
        this.results.splice(this.results.indexOf(item), 1);
      }

      this.loading = false;
    },

    async replaceAll(): Promise<void> {
      await foreachAsync(this.results, async (result) => {
        await foreachAsync(result.match, async (item, index) => {
          await this.replaceSearch(result, index);
        });
      });
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
@import "components/File Explorer/ListItem.scss";
@import "components/File Explorer/Rename.scss";

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
