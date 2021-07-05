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
          <v-card-title class="text-body-1"> Project Template </v-card-title>
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
      <v-card dark v-else class="fill-height">
        <div class="d-flex justify-space-between align-center fill-width">
          <v-card-title class="text-body-1"> Create Project </v-card-title>
          <div>
            <v-btn text color="blue" @click="create" ref="createBtn">
              Create
            </v-btn>
            <v-btn icon color="rgb(183, 185, 195)" @click="stateLocal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        <v-card-text>
          <div class="mt-2">Project Name</div>
          <v-text-field
            v-model.trim="templateSelected.name"
            class="pt-0"
            :rules="[
              () =>
                projects.some(
                  (project) => project.file === templateSelected.name.trim()
                )
                  ? `Project \&quot;${templateSelected.name}\&quot; exists`
                  : true,
              () =>
                !!templateSelected.name.trim()
                  ? true
                  : `Project required name.`,
            ]"
            required
            @keypress.enter="$refs.createBtn.$el.click()"
          />

          <div class="mt-8">Template</div>
          <div class="list-templates__group-icons mt-1">
            <v-img
              width="56px"
              height="56px"
              v-for="(item, index) in templateSelected.icons"
              :src="
                require(`@/assets/templates/${templateSelected.project}/${item}`)
              "
              :key="index"
            ></v-img>
          </div>
        </v-card-text>
      </v-card>
    </v-fade-transition>
  </v-dialog>
</template>

<script>
import templates from "@/assets/templates/all";
import { unzip } from "@/modules/zip";
import { mkdir } from "@/modules/filesystem";

export default {
  props: {
    state: {
      type: Boolean,
      default: false,
    },
    projects: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  model: {
    prop: "state",
    event: "input",
  },
  data() {
    return {
      templates,

      templateSelected: null,
    };
  },
  computed: {
    stateLocal: {
      get() {
        return this.state;
      },
      set(value) {
        this.$emit("input", value);

        if (value === false) {
          this.templateSelected = null;
        }
      },
    },
  },
  methods: {
    async create() {
      if (this.templateSelected.template) {
        await unzip({
          file: require(`@/assets/templates/${this.templateSelected.project}/template.zip`),
          to: `projects/${this.templateSelected.name}`,
        });

        this.$store.commit("terminal/clear")
      } else {
        await mkdir(`projects/${this.templateSelected.name}`);
      }

      console.log("created project");
      this.$emit("created");
      this.stateLocal = false;
    },
  },
};
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
