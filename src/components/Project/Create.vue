<template>
  <q-dialog
    class="max-width-dialog"
    full-height
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <q-card v-if="!templateSelected" class="flex column no-wrap">
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.project-template") }}
        </div>
        <q-space />
        <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="fit scroll q-pt-2 q-pb-3">
        <div class="row text-center justify-center">
          <div
            v-for="template in templates"
            :key="template.name"
            v-ripple
            @click="selectTemplate(template)"
            class="col-6 col-sm-4 col-md-3 template"
          >
            <div class="icons-group" v-if="template.icons">
              <img
                v-for="(item, index) in template.icons"
                :src="
                  require(`assets/templates/${template['directory-name']}/${item}`)
                "
                :key="index"
              />
            </div>

            <div class="label">{{ template.name }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else-if="templateSelected" class="flex column no-wrap">
      <q-card-section class="row items-center q-pb-1 q-pt-2">
        <div class="text-weight-medium text-subtitle1">
          {{ $t("label.create-project") }}
        </div>
        <q-space />
        
          <q-btn
            :label="$t('label.create')"
            flat
            color="primary"
            padding="xs"
            @click="create"
            :disable="!!error"
            class="q-mr-xs"
          />
          <q-btn icon="mdi-close" v-ripple flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="fit scroll q-pt-2 q-pb-3">
        <div class="text-subtitle2 text-weight-medium">
          {{ $t("label.project-name") }}
        </div>
        <q-input
          dense
          v-model.trim="templateSelected.name"
          :rules="[() => (error === false ? true : error)]"
          required
          @keypress.enter="create"
          autofocus
        >
          <template v-slot:error="{ message }">
            <span v-html="message" class="font-weight-medium" />
          </template>
        </q-input>

        <div class="text-subtitle2 text-weight-medium q-mt-5">
          {{ $t("label.template") }}
        </div>
        <div class="icons-group q-mt-1" v-if="templateSelected.icons">
          <img
            v-for="(item, index) in templateSelected.icons"
            :src="
              require(`assets/templates/${
                templateSelected && templateSelected['directory-name']
              }/${item}`)
            "
            :key="index"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Toast } from "@capacitor/toast";
import type { Template } from "assets/labs/Release.json";
import templates from "assets/templates/Release.json";
import fs from "modules/fs";
import { useStore } from "src/store";
import nameFileValidates from "src/validator/nameFileValidates";
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { unzip } from "zip2";

const props = defineProps<{
  modelValue: boolean;
  namesExists: readonly string[];
}>();
const emit = defineEmits<{
  (ev: "update:model-value", v: boolean): void;
  (ev: "created"): void;
}>();

const store = useStore();
const i18n = useI18n();

const templateSelected = ref<Template | null>(null);
const error = nameFileValidates(
  computed(() => templateSelected.value?.name || ""),
  false,
  toRef(props, "namesExists"),
  true
);

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (value === false) {
      templateSelected.value = null;
    }
  }
);

function selectTemplate(template: Template): void {
  templateSelected.value = {
    ...template,
  };
}
async function create() {
  // eslint-disable-next-line functional/no-let
  let created = false;

  if (templateSelected.value) {
    if (templateSelected.value.isTemplate) {
      try {
        const urlFileZip =
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require(`assets/templates/${templateSelected.value["directory-name"]}/template.zip`).default;

        store.commit(
          "terminal/info",
          i18n.t("alert.extracting-zip", {
            name: urlFileZip,
          })
        );
        await unzip({
          fs,
          data: await fetch(urlFileZip)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer()),
          extractTo: `projects/${templateSelected.value.name}`,
          onProgress: (event) => {
            if (event.isDirectory) {
              store.commit(
                "terminal/print",
                i18n.t("alert.extract-folder", {
                  name: event.filename,
                })
              );
            } else {
              store.commit(
                "terminal/print",
                i18n.t("alert.extract-file", {
                  name: event.filename,
                })
              );
            }
          },
        });

        store.commit("terminal/clear");
        created = true;
      } catch (err) {
        store.commit("terminal/error", err);
      }
    } else {
      await fs.mkdir(`projects/${templateSelected.value.name}`, {
        recursive: true,
      });
      created = true;
    }

    if (created) {
      void Toast.show({
        text: i18n.t("alert.created.project", {
          name: templateSelected.value.name,
        }),
      });
      emit("created");
    }

    emit("update:model-value", false);
  }
}
</script>

<style lang="scss" scoped>
.template {
  // width: 120px;
  padding: 8px;
  display: inline-block;

  .label {
    // padding-top: 5px;
    font-size: 13.3333px;
  }
}

.icons-group {
  display: inline-flex;
  img {
    width: 56px;
    height: 56px;
  }
  > * {
    margin-left: -14px;
  }
  > *:first-child {
    margin-left: 0;
  }
}
</style>
