<template>
  <div class="d-inline">
    <slot name="prepend" />
    <span class="file--system__icon" v-if="noIcon === false">
      <img
        :src="
          getIcon({
            light: false,
            isOpen: false,
            isFolder,
            name: newFilename,
          })
        "
      />
    </span>

    <span class="file--system__name text-truncate">
      <div class="app--rename" v-if="renaming">
        <div class="app--rename__backboardd" @click.prevent.stop="blurInput" />
        <input
          type="text"
          v-model.trim="newFilename"
          ref="input"
          @keydown.enter="blurInput"
          @blur="blur"
          :data-error="
            fileNameAlreadyExists
              ? `A file or folder ${newFilename} already exists at this localtion. Please choose a different name.`
              : ``
          "
          @click.prevent.stop="() => false"
        />
      </div>
      <span v-else @click="timeClick = Date.now()">{{ filename }}</span>
    </span>

    <slot name="append" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed,
  watch,
} from "@vue/composition-api";
import { rename } from "@/modules/filesystem";
import { join, relative } from "path";
import { Toast } from "@capacitor/toast";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon";

export default defineComponent({
  model: {
    prop: "filename",
    event: "rename",
  },
  props: {
    isFolder: {
      type: Boolean,
      required: true,
    },
    renaming: {
      type: Boolean,
      required: true,
    },
    namesExists: {
      type: Array as PropType<string[]>,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    dirname: {
      type: String,
      required: true,
    },
    allowRename: {
      type: Boolean,
      required: true,
    },
    noIcon: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const newFilename = ref<string>(props.filename);

    watch(
      () => props.filename,
      () => {
        newFilename.value = props.filename;
      }
    );

    return {
      timeClick: ref<number>(0),
      newFilename,
      fileNameAlreadyExists: computed(() =>
        props.namesExists.some(
          (name) => name === newFilename.value && name !== props.filename
        )
      ),
      getIcon,
      running: ref<boolean>(false),
    };
  },
  methods: {
    async blur(): Promise<void> {
      if (
        this.filename !== this.newFilename &&
        !!this.newFilename &&
        this.fileNameAlreadyExists === false &&
        this.running === false
      ) {
        this.running = true;
        if (this.allowRename) {
          /// rename
          this.$store.commit("progress/show");
          //// rename

          const [to, from] = [
            join(this.dirname, this.newFilename),
            join(this.dirname, this.filename),
          ];
          console.log(to, from);
          try {
            await rename(from, to);
            Toast.show({
              text: `Renamed ${this.isFolder ? "folder" : "file"} "${relative(
                "projects",
                from
              )}" to "${relative("projects", to)}"`,
            });
          } catch (err) {
            console.log(err);
            Toast.show({
              text: `Rename ${this.isFolder ? "folder" : "file"} "${relative(
                "projects",
                from
              )}" failed`,
            });
          }
          this.$store.commit("progress/hide");

          this.$emit("rename", this.newFilename);
        } else {
          this.$emit("cancel", this.newFilename);
        }
        this.running = false;
      }
      this.$emit("update:renaming", false);
    },
    blurInput() {
      (this.$refs?.input as any)?.blur();
    },
  },
  watch: {
    timeClick(newValue, oldValue) {
      if (newValue - oldValue < 500) {
        this.$emit("update:renaming", true);

        this.timeClick = 0;
      }
    },
    renaming: {
      handler(newValue) {
        if (newValue) {
          setTimeout(() => {
            (this.$refs.input as any).focus();
            (this.$refs.input as any).click();
          }, 70);
        }
      },
    },
  },
  mounted() {
    if (this.renaming) {
      setTimeout(() => {
        (this.$refs.input as any).focus();
        (this.$refs.input as any).click();
      }, 70);
    }
  },
});
</script>

<style lang="scss" scoped>
.file--system {
  &__icon {
    margin-right: 8px;
    transform: translateY(-25%);

    img {
      width: 24px;
      height: 24px;
      margin: auto;
      display: block;
      object-fit: cover;
      margin-top: 3px;
    }
  }
  &__icon {
    font-size: 20px;
    width: 1em;
    height: 1em;
    display: inline-block;
    > * {
      font-size: inherit;
    }
  }
}
</style>
<style lang="scss" scoped>
.app--rename {
  color: currentColor;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;

  &__backboardd {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba($color: #000000, $alpha: 0.5);
    z-index: 100;
  }

  input {
    all: initial;
    position: relative;
    z-index: 101;
    font: inherit;
    font-size: inherit;
    color: currentColor;
    font-weight: inherit;
    background-color: #30393f;
    display: block;
    width: 100%;
  }
}
</style>
