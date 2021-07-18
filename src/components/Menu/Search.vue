<template>
  <div class="fill-width fill-height">
    <div class="navigation--toolbar grey-2">
      <div>
        <v-btn icon>
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
        <span class="app-title"> {{ $t("Find") }} </span>
      </div>

      <div>
        <v-btn
          icon
          :color="modeRegexp ? `blue` : undefined"
          @click="modeRegexp = !modeRegexp"
        >
          <v-icon>mdi-regex</v-icon>
        </v-btn>
        <v-btn
          icon
          :color="modeLetterCase ? `blue` : undefined"
          @click="modeLetterCase = !modeLetterCase"
        >
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn
          icon
          :color="modeWordBox ? `blue` : undefined"
          @click="modeWordBox = !modeWordBox"
        >
          <v-icon>mdi-file-word-box-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="fill-height d-flex flex-column">
      <div class="px-3 pt-3">
        <div class="d-flex align-center justify-space-between">
          <div>
            <v-icon size="20px" @click="openReplace = !openReplace">
              mdi-chevron-right
            </v-icon>
          </div>
          <div class="fill-width">
            <v-text-field
              placeholder="Search"
              outline
              rounded
              class="py-1 grey-4 mx-0"
              hide-details
              v-model="keywordSearch"
              @keypress.enter="search"
            />
            <div class="d-flex mt-2" v-if="openReplace">
              <v-text-field
                placeholder="Replace"
                outline
                rounded
                class="py-1 grey-4 mx-0"
                hide-details
                v-mode="keywordReplace"
              />
              <v-icon class="ml-1" size="16px" @click="replaceAll"
                >mdi-check-all</v-icon
              >
            </div>
          </div>
        </div>
        <div class="text-right">
          <v-icon @click="openRules = !openRules">mdi-dots-horizontal</v-icon>
          <div class="text-left" v-if="openRules">
            <div>
              <small class="text-caption text--secondary"
                >files to include</small
              >
              <v-text-field
                outline
                rounded
                class="py-1 grey-4 mx-0"
                hide-details
                v-model="include"
              />
            </div>
            <div class="mt-2">
              <small class="text-caption text--secondary"
                >files to exclude</small
              >
              <v-text-field
                outline
                rounded
                class="py-1 grey-4 mx-0"
                hide-details
                v-model="exclude"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="fill-height overflow-y-scroll mb-10"
        style="position: relative"
      >
        <v-progress-linear
          indeterminate
          color="cyan"
          height="2px"
          rounded
          absolute
          top
          v-if="searching"
        />

        <App-Collapse v-for="item in results" :key="item.file" :eager="true">
          <template v-slot:activator="{ state, on }">
            <div
              class="file--system__item"
              v-on="on"
              :style="{
                height: '37px',
              }"
            >
              <div class="d-inline d-flex align-center order-0 text-truncate">
                <span class="file--system__prepend">
                  <v-icon style="color: inherit">
                    {{ state ? "mdi-chevron-down" : "mdi-chevron-right" }}
                  </v-icon>
                </span>
                <span class="file--system__icon">
                  <img
                    :src="
                      getIcon({
                        light: false,
                        isOpen: false,
                        isFolder: false,
                        name: item.basename,
                      })
                    "
                  />
                </span>
                <span class="file--system__name text-truncate"
                  >{{ item.basename }}
                  <small
                    class="text-caption text--decoration"
                    :style="{
                      color: `rgba(255, 255, 255, .5)`,
                    }"
                    >{{ item.file }}</small
                  ></span
                ><span class="chip blue">{{ item.match.length }}</span>
              </div>
              <span></span>
            </div>
          </template>

          <div
            class="d-flex align-center justify-space-between mx-4 mt-1"
            v-for="(match, index) in item.match"
            :key="match.index"
          >
            <div class="text-truncate" style="font-size: 15px">
              {{ match.firstValue
              }}<strong class="blue--text">{{ match.value }}</strong
              >{{ match.lastValue }}
            </div>

            <v-icon size="18px" @click="replaceSearch(item, index)"
              >mdi-check</v-icon
            >
          </div>
        </App-Collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "@vue/composition-api";
import {
  foreach as foreachFiles,
  readFile,
  writeFile,
} from "@/modules/filesystem";
import store from "@/store";
import { isPlainText, rawText } from "@/utils";
import { join, basename } from "path";
import escapeRegExp from "escape-string-regexp";
import AppCollapse from "@/components/App/Collapse.vue";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon";

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
    AppCollapse,
  },
  setup() {
    const modeRegexp = ref<boolean>(false);
    const modeLetterCase = ref<boolean>(false);
    const modeWordBox = ref<boolean>(false);

    const searching = ref<boolean>(false);
    const results = ref<Result[]>([]);

    const keywordSearch = ref<string>("");
    const keywordReplace = ref<string>("");
    const include = ref<string>("");
    const exclude = ref<string>("");

    async function searchInFile(file: string): Promise<Result | void> {
      if (isPlainText(file)) {
        const regexp = new RegExp(
          `(?:[^\n]{0,28}(${
            modeRegexp.value
              ? keywordSearch.value
              : escapeRegExp(keywordSearch.value)
          })(${modeWordBox.value ? "\\s|\\0$" : ""})[^\n]{0,28}){1}?`,
          "g" + (modeLetterCase.value ? "" : "i")
        );
        const rawMatch = rawText(await readFile(file)).matchAll(regexp);

        if (rawMatch) {
          const match = [...(rawMatch || [])].map((item) => {
            const [firstValue = "", lastValue = ""] = item[0].split(item[1]);

            return {
              index: item.index || -1,
              firstValue,
              value: item[1],
              lastValue,
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

    let timeoutSearch: any;
    async function search(): Promise<void> {
      clearTimeout(timeoutSearch);
      setTimeout(async () => {
        results.value.splice(0);

        searching.value = true;
        if (store.state.editor.project) {
          await foreachFiles(
            store.state.editor.project,
            [
              "^.git",
              ...exclude.value
                .replace(/\s+,\s+/g, ",")
                .split(",")
                .filter(Boolean),
            ],
            [
              ...exclude.value
                .replace(/\s+,\s+/g, ",")
                .split(",")
                .filter(Boolean),
            ],
            async (dirname, filename) => {
              const file = join(dirname, filename);

              const result = await searchInFile(file);

              if (result) {
                results.value.push(result);
              }
            }
          );
        }
        searching.value = false;
      }, 500);
    }

    watch(modeRegexp, () => void search());
    watch(modeLetterCase, () => void search());
    watch(modeWordBox, () => void search());
    watch(keywordSearch, () => void search());

    return {
      modeRegexp,
      modeLetterCase,
      modeWordBox,

      openReplace: ref<boolean>(false),
      openRules: ref<boolean>(false),

      searching,
      searchInFile,
      results,
      search,

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
      const { index, value } = item.match[matchIndex];

      const context = rawText(await readFile(file));

      const newContext =
        context.slice(0, index) +
        (this.modeRegexp
          ? value.replace(new RegExp(this.keywordSearch), this.keywordReplace)
          : this.keywordReplace) +
        context.slice(index + value.length);

      await writeFile(file, newContext);

      const newResult = await this.searchInFile(file);

      if (newResult) {
        this.results.splice(this.results.indexOf(item), 1, newResult);
      } else {
        this.results.splice(this.results.indexOf(item), 1);
      }
      this.$store.commit("system/setProgress", false);
    },

    async replaceAll(): Promise<void> {
      for await (const item of this.results) {
        for (const index in item.match) {
          await this.replaceSearch(item, +index);
        }
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import "~@/sass/global.scss";
@import "~@/sass/list-mouseright.scss";
</style>

<style lang="scss" scoped>
@import "@/components/File Explorer/ListItem.scss";
@import "@/components/File Explorer/Rename.scss";

.chip {
  font-size: 14px;
  border-radius: (1.2em / 2);
  min-width: 1.2em;
  height: 1.2em;
  text-align: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
