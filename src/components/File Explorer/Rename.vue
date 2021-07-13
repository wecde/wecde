<template>
  <div class="d-inline">
    <slot name="prepend" />
    <span
      class="file--system__icon"
      v-if="noIcon === false"
      :class="{
        renaming,
      }"
    >
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
          @keydown="newFilename = $event.target.value.trim()"
          @keyup="newFilename = $event.target.value.trim()"
          @blur="blur"
          :data-error="
            fileNameAlreadyExists
              ? `A file or folder ${newFilename} already exists at this localtion. Please choose a different name.`
              : ``
          "
          @click.prevent.stop="() => false"
        />
      </div>
      <span v-else @click="timeClick = Date.now()" style="cursor: text">{{
        filename
      }}</span>
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
  toRefs,
} from "@vue/composition-api";
import { rename } from "@/modules/filesystem";
import { join, relative, basename, extname } from "path";
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
    const { filename, renaming, namesExists } = toRefs(props);
    const newFilename = ref<string>(filename.value);

    watch(filename, () => {
      newFilename.value = filename.value;
    });
    watch(renaming, (newValue) => {
      if (newValue === false) {
        newFilename.value = filename.value;
      }
    });

    return {
      timeClick: ref<number>(0),
      newFilename,
      fileNameAlreadyExists: computed(() =>
        namesExists.value.some(
          (name) => name === newFilename.value && name !== filename.value
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
              text: this.$t(`Renamed {type} {old} to {new}`, {
                type: this.isFolder ? "folder" : "file",
                old: relative("projects", from),
                new: relative("projects", to),
              }) as string,
            });
          } catch (err) {
            console.log(err);
            Toast.show({
              text: this.$t(
                `Rename ${this.isFolder ? "folder" : "file"} "${relative(
                  "projects",
                  from
                )}" failed`
              ) as string,
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
    focusInput() {
      setTimeout(() => {
        const { input } = this.$refs as { input: any };
        input.focus();
        input.click();

        input.select();
        input.setSelectionRange(
          0,
          basename(input.value, extname(input.value)).length
        );
      }, 70);
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
          this.focusInput();
        }
      },
    },
  },
  mounted() {
    if (this.renaming) {
      this.focusInput();
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
    &.renaming {
      position: relative;
      z-index: 101;
    }
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