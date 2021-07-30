import eventBus from "@/modules/event-bus";
import { isParentFolder, pathEquals } from "@/utils";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (store: any): void => {
  // ? hydrator

  eventBus.on("move", (from, to) => {
    /// update project

    if (
      isParentFolder(from, store.state.editor.project) ||
      pathEquals(from, store.state.editor.project)
    ) {
      store.commit(
        "editor/setProject",
        store.state.editor.project.replace(from, to)
      );
    }
    /// update sessions
    store.state.editor.sessions.forEach((item: string, index: number): void => {
      if (isParentFolder(from, item) || pathEquals(from, item)) {
        /// update
        store.commit("editor/updateSession", {
          index,
          value: item.replace(from, to),
        });
      }
    });
    /// update store scroll
    for (const file in store.state.editor.scrollEnhance) {
      if (isParentFolder(from, file) || pathEquals(from, file)) {
        store.commit("editor/updateFileScrollEnhance", {
          file,
          newFile: file.replace(from, to),
        });
      }
    }
  });
  store.watch(
    () => store.state.editor.project,
    () => void store.dispatch("git-project/refresh"),
    {
      immediate: true,
    }
  );

  // ?? hydrator
};
