<template>
  <div class="flex no-wrap items-center min-width-0 full-width">
    <slot name="prepend" />
    <img
      v-if="noIcon === false"
      class="icon-file"
      :class="{
        'rename-float': renaming,
      }"
      :src="
        getIcon({
          light: $q.dark.isActive === false,
          isOpen: false,
          isFolder,
          name: renaming ? newFilename : fullpath,
        })
      "
    />

    <span class="full-width">
      <div class="name-changer" v-if="renaming">
        <teleport to="body">
          <div
            class="name-changer__backboardd"
            style="background-color: transparent; z-index: 999999998"
            @click.prevent.stop="blurInput"
          />
        </teleport>
        <div class="name-changer__backboardd" />

        <div class="name-changer__input-group">
          <div
            class="name-changer__error"
            v-if="validate !== true"
            v-html="validate"
          />
          <input
            type="text"
            v-model.trim="newFilename"
            ref="input"
            @keydown.enter="blurInput"
            @keydown="newFilename = input?.value.trim() || ''"
            @keyup="newFilename = input?.value.trim() || ''"
            @blur="blur"
            @click.prevent.stop
          />
        </div>
      </div>
      <div class="text-truncate" v-else>
        <span @click="onClickName" style="cursor: text"
          >{{ basename(fullpath) }} <slot name="append-text"
        /></span>
      </div>
    </span>

    <slot name="append" />
  </div>
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import fs from "modules/fs";
import { basename, dirname, extname, join, relative } from "path-cross";
import { Notify } from "quasar";
import { createTimeoutBy } from "src/utils";
import { useFilenameValidate } from "src/validator/useFilenameValidate";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (ev: "update:fullpath", v: string): void;
  (ev: "cancel", v: string): void;
  (ev: "update:renaming", v: boolean): void;
}>();
const props = defineProps<{
  isFolder: boolean;
  renaming: boolean;
  namesExists: readonly string[];
  fullpath: string;
  allowRename: boolean;
  noIcon?: boolean;
  allowUpdateStore: boolean;
}>();

const i18n = useI18n();

const newFilename = ref<string>("");
const firstChangedName = ref<boolean>(false);

watch(
  () => props.fullpath,
  () => {
    newFilename.value = basename(props.fullpath);
  },
  {
    immediate: true,
  }
);
watch(
  () => props.renaming,
  () => {
    newFilename.value = basename(props.fullpath);
    firstChangedName.value = false;
  }
);
watch(newFilename, () => {
  firstChangedName.value = true;
});

const timeClick = ref<number>(0);
const filenameValidate = useFilenameValidate();
const validate = computed<ReturnType<typeof filenameValidate>>(() => {
  return filenameValidate(
    newFilename.value,
    props.fullpath,
    props.namesExists,
    firstChangedName.value
  );
});
const running = ref<boolean>(false);

async function blur(): Promise<void> {
  if (
    newFilename.value !== basename(props.fullpath) &&
    validate.value === true &&
    running.value === false
  ) {
    running.value = true;
    if (props.allowRename) {
      const [to, from] = [
        join(dirname(props.fullpath), newFilename.value),
        props.fullpath,
      ];

      const task = Notify.create({
        group: false,
        spinner: true,
        type: "ongoing",
        timeout: 0,
        position: "bottom-right",
        message: i18n.t("alert.renaming"),
        caption: `${relative("projects", from)} -> ${relative("projects", to)}`,
      });

      try {
        await fs.rename(from, to);
        void Toast.show({
          text: i18n.t("alert.renamed", {
            from: relative("projects", from),
            to: relative("projects", to),
          }),
        });
        task();
      } catch {
        void Toast.show({
          text: i18n.t("alert.failure.rename", {
            from: relative("projects", from),
            to: relative("projects", to),
          }),
        });
        task({
          type: "negative",
          timeout: 1000,
          spinner: false,
          message: i18n.t("alert.failure.rename"),
          caption: `${relative("projects", from)} -> ${relative(
            "projects",
            to
          )}`,
        });
      }

      emit("update:fullpath", to);
    } else {
      emit("cancel", newFilename.value);
    }
    running.value = false;
  }
  emit("update:renaming", false);
}

const input = ref<HTMLInputElement | null>(null);
function blurInput() {
  try {
    if (document.activeElement === input.value) {
      input.value?.blur();
    }
  } catch {
    void blur();
  }
}
function focusInput() {
  createTimeoutBy(
    "file explorer.rename.fix-async-dom",
    () => {
      input.value?.focus();
      input.value?.click();

      input.value?.select();
      input.value?.setSelectionRange(
        0,
        basename(input.value.value, extname(input.value.value)).length
      );
    },
    70
  );
}
function onClickName(): void {
  if (Date.now() - timeClick.value < 500) {
    emit("update:renaming", true);

    timeClick.value = 0;
  } else {
    timeClick.value = Date.now();
  }
}

watch(
  () => props.renaming,
  (val) => {
    if (val) {
      focusInput();
    }
  }
);

onMounted(() => {
  if (props.renaming) {
    focusInput();
  }
});
</script>

<style lang="scss" scoped>
@import "src/sass/icon-file.scss";
@import "src/sass/name-changer.scss";

.icon-file {
  @include icon-file;
}
.name-changer {
  @include name-changer;
}
</style>
