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
            name: renaming ? newFilename : basename(fullpath),
          })
        "
      />
    </span>

    <span class="file--system__name">
      <div class="app--rename" v-if="renaming">
        <div class="app--rename__backboardd" @click.prevent.stop="blurInput" />
        <div class="app--rename__input-group">
          <div class="app--rename__error" v-if="error" v-html="error" />
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
import {
  defineComponent,
  ref,
  PropType,
  watch,
  toRefs,
} from "@vue/composition-api";
import { rename } from "@/modules/filesystem";
import { join, relative, basename, extname, dirname } from "path";
import { Toast } from "@capacitor/toast";
import getIcon from "@/assets/extensions/material-icon-theme/dist/getIcon";
import nameFileValidates from "@/validator/nameFileValidates";

export default defineComponent({
  model: {
    prop: "fullpath",
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
          this.$store.commit("system/setProgress", false);

          this.$emit("rename", to);
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
  mounted() {
    if (this.renaming) {
      this.focusInput();
    }
  },
});
</script>

<style lang="scss" scoped>
@import "./Rename.scss";
</style>
