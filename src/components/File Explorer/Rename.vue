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
          light: false,
          isOpen: false,
          isFolder,
          name: renaming ? newFilename : basename(fullpath),
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
          <div class="name-changer__error" v-if="error" v-html="error" />
          <input
            type="text"
            v-model.trim="newFilename"
            ref="input"
            @keydown.enter="blurInput"
            @keydown="newFilename = $event.target.value.trim()"
            @keyup="newFilename = $event.target.value.trim()"
            @blur="blur"
            @click.prevent.stop="() => false"
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

<script lang="ts">
import { Toast } from "@capacitor/toast";
import getIcon from "assets/extensions/material-icon-theme/dist/getIcon";
import { rename } from "modules/filesystem";
import { basename, dirname, extname, join, relative } from "path-cross";
import { createTimeoutBy } from "src/utils";
import nameFileValidates from "src/validator/nameFileValidates";
import { defineComponent, ref, toRefs, watch } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  emits: ["update:fullpath", "cancel", "update:renaming"],
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
      type: Array as PropType<readonly string[]>,
      required: true,
    },
    fullpath: {
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
    allowUpdateStore: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  setup(props) {
    const { fullpath, renaming, namesExists } = toRefs(props);
    const newFilename = ref<string>("");
    const firstChangedName = ref<boolean>(false);

    watch(
      fullpath,
      () => {
        newFilename.value = basename(fullpath.value);
      },
      {
        immediate: true,
      }
    );
    watch(renaming, () => {
      newFilename.value = basename(fullpath.value);
      firstChangedName.value = false;
    });
    watch(newFilename, () => {
      firstChangedName.value = true;
    });

    return {
      timeClick: ref<number>(0),
      newFilename,
      firstChangedName,
      error: nameFileValidates(
        newFilename,
        fullpath,
        namesExists,
        firstChangedName
      ),
      running: ref<boolean>(false),
    };
  },
  methods: {
    getIcon,
    basename,
    async blur(): Promise<void> {
      if (
        this.newFilename !== basename(this.fullpath) &&
        this.error === false &&
        this.running === false
      ) {
        this.running = true;
        if (this.allowRename) {
          /// rename
          this.$store.commit("system/setProgress", true);
          //// rename

          const [to, from] = [
            join(dirname(this.fullpath), this.newFilename),
            this.fullpath,
          ];
          try {
            await rename(from, to);
            void Toast.show({
              text: this.$t(
                `alert.renamed.${this.isFolder ? "folder" : "file"}-from-to`,
                {
                  old: relative("projects", from),
                  new: relative("projects", to),
                }
              ),
            });
          } catch (err) {
            console.log(err);
            void Toast.show({
              text: this.$t(
                `alert.rename.${this.isFolder ? "folder" : "file"}-failed`,
                {
                  path: relative("projects", from),
                }
              ),
            });
          }
          this.$store.commit("system/setProgress", false);

          this.$emit("update:fullpath", to);
        } else {
          this.$emit("cancel", this.newFilename);
        }
        this.running = false;
      }
      this.$emit("update:renaming", false);
    },
    blurInput() {
      try {
        if (document.activeElement === this.$refs.input) {
          (this.$refs?.input as HTMLInputElement)?.blur();
        }
      } catch {
        void this.blur();
      }
    },
    focusInput() {
      createTimeoutBy(
        "file explorer.rename.fix-async-dom",
        () => {
          const { input } = this.$refs as { input: HTMLInputElement };
          input.focus();
          input.click();

          input.select();
          input.setSelectionRange(
            0,
            basename(input.value, extname(input.value)).length
          );
        },
        70
      );
    },
    onClickName(): void {
      if (Date.now() - this.timeClick < 500) {
        this.$emit("update:renaming", true);

        this.timeClick = 0;
      } else {
        this.timeClick = Date.now();
      }
    },
  },
  watch: {
    renaming: {
      handler(newValue) {
        if (newValue) {
          this.focusInput();
        }
      },
    },
  },
  onMounted() {
    if (this.renaming) {
      this.focusInput();
    }
  },
});
</script>

<style lang="scss" scoped>
@import "./Rename.scss";

.icon-file {
  @include icon-file();
}
.name-changer {
  @include name-changer();
}
</style>
