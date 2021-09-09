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
              dense
              square
              outlined
              v-model="include"
              placeholder="(e.g *.ts, src/**/include)"
            />

            <small class="text-caption q-mt-1">{{
              $t("label.files-exclude")
            }}</small>
            <q-input
              dense
              square
              outlined
              v-model="exclude"
              placeholder="(e.g *.ts, src/**/exclude)"
            />
          </div>
        </div>

        <div style="position: relative" class="full-height scroll q-ml-n4">
          <q-linear-progress
            indeterminate
            color="cyan"
            size="2px"
            rounded
            style="position: absolute; top: 0"
            v-if="loading"
          />

          <App-Collapse
            v-for="result in searchFilesResults"
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
                      light: false,
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

                  <q-btn
                    color="inherit"
                    flat
                    dense
                    icon="mdi-check"
                    padding="none"
                    size="0.8em"
                    rounded
                    @click.prevent.stop="replaceInFile(result)"
                  />

                  <q-badge rounded color="primary">{{
                    result.matches.length
                  }}</q-badge>
                </div>
              </div>
            </template>

            <div
              class="flex items-center justify-between search-highlight"
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
                    flags: result.flags,
                    match,
                  })
                "
              />
            </div>
          </App-Collapse>
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
import {
  refreshSearchInFiles,
  useSearchInFiles,
} from "src/worker/search-in-files";
import type {
  Result,
  Result as SearchResult,
} from "src/worker/search-in-files.worker";
import { reactive, ref, watch } from "vue";

import TemplateTab from "./template/Tab.vue";

const store = useStore();

const useRegexp = ref<boolean>(false);
const useLetterCase = ref<boolean>(false);
const useWordbox = ref<boolean>(false);

const loading = ref<boolean>(false);
const searchFilesResults = reactive<SearchResult[]>([]);

const searchValue = ref<string>("");
const replaceValue = ref<string>("");
const include = ref<string>("");
const exclude = ref<string>("");

watch([useRegexp, useLetterCase, useWordbox], () => void search());
// watch(searchValue, () => void search());

const replacerOpened = ref<boolean>(false);
const openRules = ref<boolean>(false);

async function search(): Promise<void> {
  if (store.state.editor.project) {
    loading.value = true;

    void refreshSearchInFiles();
    // eslint-disable-next-line functional/immutable-data
    searchFilesResults.splice(0);

    await useSearchInFiles().search({
      fs,
      dir: store.state.editor.project,
      keyword: searchValue.value,
      useRegexp: useRegexp.value,
      useWordbox: useWordbox.value,
      useLetterCase: useLetterCase.value,
      include: include.value,
      exclude: exclude.value,
      // eslint-disable-next-line functional/immutable-data
      onProgress: (rt) => searchFilesResults.push(rt),
    });

    loading.value = false;
  }
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
  flags,
  match,
}: {
  fullpath: string;
  regexp: string;
  flags: string;
  match: Result["matches"][0];
}) {
  if (store.state.editor.project) {
    loading.value = true;

    await useSearchInFiles().replaceByMatch({
      fs,
      fullpath,
      regexp,
      flags,
      match,
      replaceValue: replaceValue.value,
    });

    loading.value = false;
  }
}
async function replaceAll(): Promise<void> {
  // don't need use loading
  await Promise.all(searchFilesResults.map((result) => replaceInFile(result)));
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
