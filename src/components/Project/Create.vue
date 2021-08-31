<template>
  <q-dialog
    class="max-width-dialog"
    full-height
    full-width
    transition-show="jump-down"
    transition-hide="jump-up"
    v-model="stateLocal"
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
        <div>
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
        </div>
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

<script lang="ts">
import { Toast } from "@capacitor/toast";
import type { Template } from "assets/labs/Release.json";
import templates from "assets/templates/Release.json";
import fs from "modules/fs";
import nameFileValidates from "src/validator/nameFileValidates";
import { computed, defineComponent, ref, toRefs } from "vue";
import type { PropType } from "vue";
import { unzip } from "zip2";

export default defineComponent({
  emits: ["update:state", "created"],
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    namesExists: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
  },
  setup(props) {
    const { namesExists } = toRefs(props);
    const templateSelected = ref<Template | null>(null);

    return {
      templates,
      templateSelected,
      error: nameFileValidates(
        computed(() => templateSelected.value?.name || ""),
        false,
        namesExists,
        true
      ),
    };
  },
  computed: {
    stateLocal: {
      get(): boolean {
        return this.state;
      },
      set(value: boolean): void {
        this.$emit("update:state", value);

        if (value === false) {
          this.templateSelected = null;
        }
      },
    },
  },
  methods: {
    selectTemplate(template: Template): void {
      this.templateSelected = {
        ...template,
      };
    },
    async create() {
      // eslint-disable-next-line functional/no-let
      let created = false;

      if (this.templateSelected) {
        if (this.templateSelected.isTemplate) {
          try {
            const urlFileZip =
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require(`assets/templates/${this.templateSelected["directory-name"]}/template.zip`).default;

            this.$store.commit(
              "terminal/info",
              this.$t("alert.extracting-zip", {
                name: urlFileZip,
              })
            );
            await unzip({
              fs,
              data: await fetch(urlFileZip)
                .then((res) => res.blob())
                .then((blob) => blob.arrayBuffer()),
              extractTo: `projects/${this.templateSelected.name}`,
              onProgress: (event) => {
                if (event.isDirectory) {
                  this.$store.commit(
                    "terminal/print",
                    this.$t("alert.extract-folder", {
                      name: event.filename,
                    })
                  );
                } else {
                  this.$store.commit(
                    "terminal/print",
                    this.$t("alert.extract-file", {
                      name: event.filename,
                    })
                  );
                }
              },
            });

            this.$store.commit("terminal/clear");
            created = true;
          } catch (err) {
            console.log(err);
            this.$store.commit("terminal/error", err);
          }
        } else {
          await fs.mkdir(`projects/${this.templateSelected.name}`, {
            recursive: true,
          });
          created = true;
        }

        if (created) {
          void Toast.show({
            text: this.$t("alert.created.project", {
              name: this.templateSelected.name,
            }),
          });
          console.log("created project");
          this.$emit("created");
          this.stateLocal = false;
        }
      }
    },
  },
});
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
