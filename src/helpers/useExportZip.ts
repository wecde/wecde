import { saveAs } from "file-saver";
import fs from "modules/fs";
import { basename } from "path-cross";
import { useStore } from "src/store";
import { useI18n } from "vue-i18n";
import { zip } from "zip2";

export function useExportZip() {
  const store = useStore();
  const i18n = useI18n();

  return async (path: string): Promise<void> => {
    store.commit(
      "terminal/info",
      i18n.t("alert.ziping", {
        name: path,
      })
    );

    const buffer = await zip({
      fs,
      path,
      filepaths: ["!.git/"],
      return: false,
      onProgress: (event) => {
        if (event.isDirectory) {
          store.commit(
            "terminal/print",
            i18n.t("alert.adding.directory", {
              name: path,
            })
          );
        } else {
          store.commit(
            "terminal/print",
            i18n.t("alert.adding.file", {
              name: path,
            })
          );
        }
      },
    });

    store.commit(
      "terminal/print",
      i18n.t("alert.saving-file", {
        name: basename(path) + ".zip",
      })
    );

    saveAs(new Blob([buffer]), basename(path) + ".zip");
  };
}
