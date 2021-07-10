<template>
  <v-dialog
    transition="dialog-top-transition"
    max-width="600"
    content-class="dialog--templates"
    v-model="stateLocal"
  >
    <v-fade-transition mode="in-out">
      <v-card dark v-if="!templateSelected" class="fill-height">
        <div class="d-flex justify-space-between align-center fill-width">
          <v-card-title class="text-body-1">
            {{ $t("Project Template") }}
          </v-card-title>
          <div>
            <v-btn icon color="rgb(183, 185, 195)" @click="stateLocal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text>
          <ul class="list-templates">
            <li
              v-for="template in templates"
              :key="template.name"
              v-ripple
              @click="
                templateSelected = {
                  ...template,
                }
              "
            >
              <div>
                <div class="list-templates__group-icons">
                  <v-img
                    width="56px"
                    height="56px"
                    eager
                    v-for="(item, index) in template.icons"
                    :src="
                      require(`@/assets/templates/${template.project}/${item}`)
                    "
                    :key="index"
                  ></v-img>
                </div>

                <div class="label">{{ template.name }}</div>
              </div>
            </li>
          </ul>
        </v-card-text>
      </v-card>
      <v-card dark v-else-if="templateSelected" class="fill-height">
        <div class="d-flex justify-space-between align-center fill-width">
          <v-card-title class="text-body-1">
            {{ $t("Create Project") }}
          </v-card-title>
          <div>
            <v-btn text color="blue" @click="create">
              {{ $t("Create") }}
            </v-btn>
            <v-btn icon color="rgb(183, 185, 195)" @click="stateLocal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text>
          <div class="mt-2">{{ $t("Project Name") }}</div>
          <v-text-field
            v-model.trim="templateSelected.name"
            class="pt-0"
            :rules="[
              () =>
                nameProjects.some(
                  (projectName) =>
                    templateSelected &&
                    projectName === templateSelected.name.trim()
                )
                  ? $t(`Project {name} already exists`, {
                      name: templateSelected && templateSelected.name,
                    })
                  : true,
              () =>
                templateSelected && !!templateSelected.name.trim()
                  ? true
                  : $t(`Project required name`),
            ]"
            required
            @keypress.enter="create"
          />

          <div class="mt-8">Template</div>
          <div class="list-templates__group-icons mt-1">
            <v-img
              width="56px"
              height="56px"
              v-for="(item, index) in templateSelected.icons"
              :src="
                require(`@/assets/templates/${
                  templateSelected && templateSelected.project
                }/${item}`)
              "
              :key="index"
            ></v-img>
          </div>
        </v-card-text>
      </v-card>
    </v-fade-transition>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "@vue/composition-api";
import templates, { Template } from "@/assets/templates/all.json";
import { unzip } from "@/modules/zip";
import { mkdir } from "@/modules/filesystem";
import { Toast } from "@capacitor/toast";

export default defineComponent({
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    nameProjects: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
  },
  model: {
    prop: "state",
    event: "input",
  },
  setup() {
    return {
      templates,
      templateSelected: ref<Template | null>(null),
    };
  },
  computed: {
    stateLocal: {
      get(): boolean {
        return this.state;
      },
      set(value: boolean): void {
        this.$emit("input", value);

        if (value === false) {
          this.templateSelected = null;
        }
      },
    },
  },
  methods: {
    async create() {
      let created = false;

      if (this.templateSelected) {
        if (this.templateSelected.template) {
          try {
            await unzip({
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              file: require(`@/assets/templates/${this.templateSelected.project}/template.zip`)
                .default,
              to: `projects/${this.templateSelected.name}`,
            });

            this.$store.commit("terminal/clear");
            created = true;
          } catch (err) {
            this.$store.commit("terminal/error", err);
          }
        } else {
          await mkdir(`projects/${this.templateSelected.name}`);
          created = true;
        }

        if (created) {
          Toast.show({
            text: this.$t(`Created project {name}`, {
              name: this.templateSelected.name,
            }) as string,
          });
          console.log("created project");
          this.$emit("created");
        }
        this.stateLocal = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.list-templates {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
  display: flex;
  flex-wrap: wrap;

  li {
    display: inline-block;
    position: relative;
    width: 120px;
    flex: 1;
    > div {
      width: 120px;
      padding: 8px;
      display: inline-block;
    }

    .label {
      // padding-top: 5px;
      font-size: 13.3333px;
    }
  }

  max-height: 520px;
  overflow-y: auto;
  padding-bottom: 50px;

  &__group-icons {
    display: inline-flex;
    > * {
      margin-left: -14px;
    }
    > *:first-child {
      margin-left: 0;
    }
  }
}
</style>

<style lang="scss">
.dialog--templates {
  height: 100%;
  overflow: hidden;
}
</style>
