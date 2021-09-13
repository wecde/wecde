import { basename, dirname, join } from "path-cross";
import fs from "src/modules/fs";
import { useStore } from "src/store";
import { ProjectJSON } from "src/types/ProjectJSON";
import { createTimeoutBy } from "src/utils";
import { parse } from "src/utils/json";
import { computed, onBeforeUnmount, ref, watch, WatchStopHandle } from "vue";

export function useMetadata() {
  const store = useStore();
  const dir = computed<string | null>(() => store.state.editor.project);

  const meta = ref<ProjectJSON | null>(null);
  const pathToMeta = computed<string | null>(() =>
    dir.value ? join(".metadata", basename(dir.value), "project.json") : null
  );

  // load metadata
  async function loadMetadata(): Promise<void> {
    if (pathToMeta.value) {
      const raw: ProjectJSON = parse(
        await fs.readFile(pathToMeta.value, "utf8").catch(() => "")
      );

      cancelAutoSave();
      meta.value = raw;
      registerAutoSave();
      // un json
      // * unpacking data
    }
  }
  // save metadata
  function saveMetadata() {
    createTimeoutBy(
      "save metadata " + pathToMeta.value,
      async () => {
        if (pathToMeta.value) {
          const raw: string = JSON.stringify(meta.value);

          const dirMeta = dirname(pathToMeta.value);
          if ((await fs.isDirectory(dirMeta)) === false) {
            if (await fs.exists(dirMeta)) {
              // remove remove if is file
              await fs.unlink(dirMeta);
            }
            await fs.mkdir(dirMeta, {
              recursive: true,
            });
          }

          cancelAutoLoad();
          await fs.writeFile(pathToMeta.value, raw, "utf8");
          registerAutoLoad();
        }
      },
      1000
    );
  }

  // * watch .metadata/${basename(dir)}/project.json call to load
  // eslint-disable-next-line functional/no-let
  let watcherAutoLoad: ReturnType<typeof fs.watch>;

  function registerAutoLoad() {
    watcherAutoLoad = fs.watch(
      () => pathToMeta.value || "",
      () => {
        if (pathToMeta.value) {
          void loadMetadata();
        }
      },
      {
        type: "file",
        mode: "absolute",
        immediate: true,
      }
    );
  }
  function cancelAutoLoad() {
    watcherAutoLoad?.();
  }

  onBeforeUnmount(() => void cancelAutoLoad());

  // eslint-disable-next-line functional/no-let
  let watcherAutoSave: WatchStopHandle;

  function registerAutoSave() {
    void cancelAutoSave();

    watcherAutoSave = watch(meta, () => void saveMetadata(), {
      deep: true,
    });
  }
  function cancelAutoSave() {
    watcherAutoSave?.();
  }

  onBeforeUnmount(() => void cancelAutoSave());

  void registerAutoLoad();
  void registerAutoSave();

  const setupDone = ref<boolean>(false);
  const setupMetadata = loadMetadata().then(() => (setupDone.value = true));

  return {
    meta,
    loadMetadata,
    saveMetadata,
    setupMetadata,
    setupDone,

    fullpathSessionNow: computed<string | null>(() => {
      if (setupDone.value) {
        if (meta.value?.["sessions"]?.length) {
          // clear session-history invalidate in .metadata

          const sessionHistoryValidate =
            meta.value["session-history"]?.filter((indexInSessions) => {
              return (
                indexInSessions <
                ((meta.value as ProjectJSON)["sessions"] as readonly string[])
                  .length
              );
            }) || [];

          const sessionIndex =
            sessionHistoryValidate[sessionHistoryValidate.length - 1] ??
            meta.value["sessions"].length - 1;

          return join(dir.value || "", meta.value["sessions"][sessionIndex]);
        }
      }

      return null;
    }),
  };
}
