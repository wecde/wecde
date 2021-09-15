import { Toast } from "@capacitor/toast";
import { join } from "path-cross";
import selectFiles from "select-files";
import { useStore } from "src/store";
import { useI18n } from "vue-i18n";

import fs from "../modules/fs";

export function useImportFiles() {
  const store = useStore();
  const i18n = useI18n();

  return async (
    folderSave: string,
    multiple = true
  ): Promise<void> => {
    store.commit("terminal/print", i18n.t("alert.importing"));
    const files = Array.from(
      (await selectFiles({
        multiple,
      })) || []
    );

    if (files.length > 0) {
      await Promise.all(
        files.map(async (file, index) => {
          store.commit(
            "terminal/print",
            i18n.t("alert.saving.file", {
              name: file.name,
            }) + `(${index + 1}/${files.length})`
          );
          await fs.writeFile(
            join(folderSave, file.name),
            await file.arrayBuffer()
          );
        })
      );
    }

    store.commit("terminal/clear");
    void Toast.show({
      text: i18n.t("alert.imported.file(s)", {
        list: files.map(({ name }) => `"${name}"`).join(", "),
      }),
    });
  };
}
