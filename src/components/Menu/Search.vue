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
        :color="useRegexp ? `blue` : undefined"
        @click="useRegexp = !useRegexp"
      />
      <q-btn
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
        icon="mdi-format-letter-case"
        :color="useLetterCase ? `blue` : undefined"
        @click="useLetterCase = !useLetterCase"
      />
      <q-btn
        flat
        round
        padding="xs"
        size="13px"
        class="q-ml-xs"
        icon="mdi-file-word-box-outline"
        :color="useWordbox ? `blue` : undefined"
        @click="useWordbox = !useWordbox"
      />
    </template>

    <template v-slot:contents>
      <div class="flex no-wrap column fit">
        <div class="flex no-wrap items-center justify-between q-ml-n4">
          <q-icon
            size="20px"
            @click="replacerOpened = !replacerOpened"
            :name="replacerOpened ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          />
          <div class="full-width">
            <q-input
              dense
              square
              outlined
              :placeholder="$t('placeholder.search')"
              v-model="searchValue"
              @keypress.enter="search"
            />
            <q-input
              dense
              square
              outlined
              :placeholder="$t('placeholder.replace')"
              class="q-mt-1"
              v-model="replaceValue"
              v-show="replacerOpened"
            >
              <template v-slot:append>
                <q-icon
                  @click="replaceAll"
                  v-ripple="false"
                  name="mdi-file-replace-outline"
                  size="0.7em"
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
          <div class="text-left q-mt-n3 q-mb-4" v-show="openRules">
            <small class="text-caption">{{ $t("label.files-include") }}</small>
            <q-input
              dense
              square
              outlined
              v-model="include"
              placeholder="(e.g *.ts, src/**/include)"
            >
              <template v-slot:append>
                <q-icon
                  v-ripple="false"
                  name="mdi-note-multiple-outline"
                  size="0.7em"
                  :class="{
                    [$q.dark.isActive ? 'text-white' : 'text-black']:
                      useMultipleSearch,
                  }"
                  @click="useMultipleSearch = !useMultipleSearch"
                />
              </template>
            </q-input>

            <small class="text-caption q-mt-1">{{
              $t("label.files-exclude")
            }}</small>
            <q-input
              dense
              square
              outlined
              v-model="exclude"
              placeholder="(e.g *.ts, src/**/exclude)"
            >
              <template v-slot:append>
                <q-icon
                  v-ripple="false"
                  name="mdi-cog-outline"
                  size="0.7em"
                  :class="{
                    [$q.dark.isActive ? 'text-white' : 'text-black']:
                      useExclude,
                  }"
                  @click="useExclude = !useExclude"
                />
              </template>
            </q-input>
          </div>
        </div>

        <small class="text-grey-5 q-mt-n3 q-mb-1 text-caption">
          <template v-if="searchFilesResults.size > 0">
            {{
              Array.from(searchFilesResults.values()).reduce(
                (a, { matches: { length } }) => a + length,
                0
              )
            }}
            results in {{ searchFilesResults.size }} files
          </template>
          <template v-else-if="searchValue !== ''">
            No results found in '{{ include }}' excluding '{{ exclude }}'
          </template>
        </small>

        <div style="position: relative" class="full-height q-ml-n4">
          <q-linear-progress
            indeterminate
            color="cyan"
            size="2px"
            rounded
            style="position: absolute; top: 0"
            class="q-mr-n4"
            v-if="loading"
          />

          <q-virtual-scroll
            style="max-height: 100%"
            :items="Array.from(searchFilesResults.values())"
            separator
          >
            <template v-slot="{ item: result }">
              <App-Collapse
                :key="result.fullpath"
                :eager="true"
                content-class="q-ml-4"
              >
                <template v-slot:activator="{ state, on }">
                  <div
                    class="file-object"
                    :class="{
                      dark: $q.dark.isActive,
                    }"
                    v-on="on"
                    v-ripple
                  >
                    <q-icon
                      size="20px"
                      :name="state ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                    />
                    <img
                      class="icon-file"
                      :src="
                        getIcon({
                          light: $q.dark.isActive === false,
                          isOpen: false,
                          isFolder: false,
                          name: result.basename,
                        })
                      "
                    />

                    <div
                      class="
                        full-width
                        flex
                        no-wrap
                        justify-between
                        items-center
                        text-weight-medium
                      "
                    >
                      <div class="text-truncate">
                        {{ result.basename }}
                        <small
                          class="text-caption"
                          style="opacity: 0.8; min-width: 1.2em"
                          >{{ result.pathOfProject }}</small
                        >
                      </div>

                      <div>
                        <q-btn
                          color="inherit"
                          flat
                          dense
                          icon="mdi-check"
                          padding="none"
                          size="0.75em"
                          rounded
                          class="q-mr-1"
                          @click.prevent.stop="replaceInFile(result)"
                          v-if="replacerOpened"
                        />

                        <q-badge rounded color="primary">{{
                          result.matches.length
                        }}</q-badge>
                      </div>
                    </div>
                  </div>
                </template>

                <div
                  class="
                    flex
                    no-wrap
                    items-center
                    justify-between
                    search-highlight
                  "
                  :class="{
                    dark: $q.dark.isActive,
                  }"
                  v-for="match in result.matches"
                  :key="match.index"
                  v-ripple
                >
                  <div class="text-truncate" style="font-size: 15px">
                    {{ match.firstValue
                    }}<strong class="text-blue">{{ match.value }}</strong
                    >{{ match.lastValue }}
                  </div>

                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-check"
                    padding="none"
                    size="0.8em"
                    rounded
                    @click.prevent.stop="
                      replaceByMatch({
                        fullpath: result.fullpath,
                        regexp: result.regexp,
                        match,
                      })
                    "
                    v-if="replacerOpened"
                  />
                </div>
              </App-Collapse>
            </template>
          </q-virtual-scroll>
        </div>
      </div>
    </template>
  </Template-Tab>
</template>

<script lang="ts" setup>
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import AppCollapse from "components/App/Collapse.vue";
import fs from "modules/fs";
import { useStore } from "src/store";
import { createTimeoutBy } from "src/utils";
import {
  refreshSearchInFiles,
  useSearchInFiles,
} from "src/worker/search-in-files";
import type {
  Result,
  Result as SearchResult,
} from "src/worker/search-in-files.worker";
import { onUnmounted, reactive, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

const store = useStore();

const useRegexp = ref<boolean>(false);
const useLetterCase = ref<boolean>(false);
const useWordbox = ref<boolean>(false);

const useMultipleSearch = ref<boolean>(true);
const useExclude = ref<boolean>(true);

const loading = ref<boolean>(false);
const searchFilesResults = reactive<Map<string, SearchResult>>(new Map());

const searchValue = ref<string>("");
const replaceValue = ref<string>("");
const include = ref<string>("");
const exclude = ref<string>("");

watch(
  [useRegexp, useLetterCase, useWordbox, useMultipleSearch, useExclude],
  () => void search()
);
watch([searchValue, replaceValue, include, exclude], () => void search());
// watch(searchValue, () => void search());

const replacerOpened = ref<boolean>(false);
const openRules = ref<boolean>(false);

const watchersFiles: Map<string, () => void> = new Map();
onUnmounted(() => {
  watchersFiles.forEach((watcher) => void watcher());
  watchersFiles.clear();
});

function search() {
  createTimeoutBy(
    "search",
    async () => {
      if (store.state.editor.project) {
        loading.value = true;

        void refreshSearchInFiles();
        searchFilesResults.clear();

        watchersFiles.forEach((watcher) => void watcher());
        watchersFiles.clear();

        await useSearchInFiles().search({
          fs,
          dir: store.state.editor.project,
          keyword: searchValue.value,
          useRegexp: useRegexp.value,
          useWordbox: useWordbox.value,
          useLetterCase: useLetterCase.value,
          include: include.value,
          exclude: useExclude.value ? exclude.value : "",
          multipleSearch: useMultipleSearch.value,
          onProgress: (rt) => searchFilesResults.set(rt.fullpath, rt),
        });

        searchFilesResults.forEach((result) => {
          const watcher = fs.watch(
            result.fullpath,
            async ({ action }) => {
              if (action === "write:file") {
                // update;
                loading.value = true;

                const newRsl = await useSearchInFiles().searchInFile({
                  fs,
                  fullpath: result.fullpath,
                  keyword: searchValue.value,
                  useRegexp: useRegexp.value,
                  useWordbox: useWordbox.value,
                  useLetterCase: useLetterCase.value,
                });

                if (newRsl) {
                  searchFilesResults.set(newRsl.fullpath, newRsl);

                  loading.value = false;

                  return void 0;
                }

                action = "remove:file";

                loading.value = false;
              }
              if (action === "remove:file") {
                // remove;

                searchFilesResults.delete(result.fullpath);
                if (watchersFiles.has(result.fullpath)) {
                  watchersFiles.get(result.fullpath)?.();
                }
              }
            },
            {
              type: "file",
              mode: "absolute",
            }
          );

          watchersFiles.set(result.fullpath, watcher);
        });

        loading.value = false;
      }
    },
    1500
  );
}
async function replaceInFile(searchResult: Result): Promise<void> {
  if (store.state.editor.project) {
    loading.value = true;

    await useSearchInFiles().replaceInFile({
      fs,
      searchResult,
      replaceValue: replaceValue.value,
    });

    loading.value = false;
  }
}
async function replaceByMatch({
  fullpath,
  regexp,
  match,
}: {
  fullpath: string;
  regexp: string;
  match: Result["matches"][0];
}) {
  if (store.state.editor.project) {
    loading.value = true;

    await useSearchInFiles().replaceByMatch({
      fs,
      fullpath,
      regexp,
      match,
      replaceValue: replaceValue.value,
    });

    loading.value = false;
  }
}
async function replaceAll(): Promise<void> {
  // don't need use loading
  await Promise.all(
    Array.from(searchFilesResults.values()).map((result) =>
      replaceInFile(result)
    )
  );
}
</script>

<style lang="scss" scoped>
@import "src/sass/file-object.scss";
@import "src/sass/icon-file.scss";

.file-object {
  @include file-object;

  padding: {
    left: 3px;
    right: 0;
  }
}
.icon-file {
  @include icon-file;
}

.search-highlight {
  color: #5e6d82;
  position: relative;

  &.dark {
    color: #b9bbc1;
  }
}
</style>
