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
        icon="mdi-file-word-box-outline"
        :color="modeWordBox ? `blue` : undefined"
        @click="modeWordBox = !modeWordBox"
      />
    </template>

    <template v-slot:contents>
      <div class="flex no-wrap column fit">
        <div class="flex no-wrap items-center justify-between q-ml-n4">
          <q-icon
            size="20px"
            @click="openReplace = !openReplace"
            :name="openReplace ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          />
          <div class="full-width">
            <q-input
              dense
              square
              outlined
              :placeholder="$t('placeholder.search')"
              v-model="keywordSearch"
              @keypress.enter="search"
            />
            <q-input
              dense
              square
              outlined
              :placeholder="$t('placeholder.replace')"
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
            v-for="result in results"
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
                  <q-badge rounded color="primary">{{
                    result.match.length
                  }}</q-badge>
                </div>
              </div>
            </template>

            <div
              class="flex items-center justify-between search-highlight"
              :class="{
                dark: $q.dark.isActive,
              }"
              v-for="(match, index) in result.match"
              :key="match.index"
              v-ripple
              @click="
                gotoEditor(
                  result.fullpath,
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
                @click.prevent.stop="replaceSearch(result, index)"
                name="mdi-check"
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
import { foreachAsync } from "src/utils";
import {
  refreshSearchInFiles,
  useSearchInFiles,
} from "src/worker/search-in-files";
import type { Result as SearchResult } from "src/worker/search-in-files.worker";
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import TemplateTab from "./template/Tab.vue";

const store = useStore();
const router = useRouter();

const modeRegexp = ref<boolean>(false);
const modeLetterCase = ref<boolean>(false);
const modeWordBox = ref<boolean>(false);

const loading = ref<boolean>(false);
const results = reactive<SearchResult[]>([]);

const keywordSearch = ref<string>("");
const keywordReplace = ref<string>("");
const include = ref<string>("");
const exclude = ref<string>("");

watch([modeRegexp, modeLetterCase, modeWordBox], () => void search());
// watch(keywordSearch, () => void search());

const openReplace = ref<boolean>(false);
const openRules = ref<boolean>(false);

async function search(): Promise<void> {
  if (store.state.editor.project) {
    loading.value = true;

    void refreshSearchInFiles();
    // eslint-disable-next-line functional/immutable-data
    results.splice(0);

    await useSearchInFiles().search({
      fs,
      dir: store.state.editor.project,
      keyword: keywordSearch.value,
      useRegexp: modeRegexp.value,
      useWordbox: modeWordBox.value,
      useLetterCase: modeLetterCase.value,
      include: include.value,
      exclude: exclude.value,
      // eslint-disable-next-line functional/immutable-data
      onProgress: (rt) => results.push(rt),
    });

    loading.value = false;
  }
}

async function replaceSearch(
  item: SearchResult,
  matchIndex: number
): Promise<void> {
  loading.value = true;

  const { fullpath } = item;
  const context = await fs.readFile(fullpath, "utf8");
  const { index, value } = item.match[matchIndex];

  // eslint-disable-next-line functional/no-let
  let newContext =
    context.slice(0, index) +
    (modeRegexp.value
      ? value.replace(new RegExp(keywordSearch.value), keywordReplace.value)
      : keywordReplace.value) +
    context.slice(index + value.length);

  await fs.writeFile(fullpath, newContext);

  loading.value = false;
}

async function replaceAll(): Promise<void> {
  await foreachAsync(results, async (result) => {
    await foreachAsync(result.match, async (item, index) => {
      await replaceSearch(result, index);
    });
  });
}

function gotoEditor(file: string, start: number, stop: number): void {
  void router.push({
    name: "editor",
    query: {
      selection: `${start}->${stop}`,
    },
  });
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

  &.dark {
    color: #b9bbc1;
  }
}
</style>
