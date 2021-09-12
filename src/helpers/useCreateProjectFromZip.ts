import fs from "modules/fs";
import { basename, extname, join } from "path-cross";
import selectFiles from "select-files";
import { useStore } from "src/store";
import { useI18n } from "vue-i18n";
import { unzip } from "zip2";

export function useCreateProjectFromZip() {
  const store = useStore();
  const i18n = useI18n();

  return async (folderExtract: string): Promise<readonly string[]> => {
    store.commit("terminal/print", i18n.t("alert.import-files"));
    const files = Array.from(
      (await selectFiles({
        accept: "*.zip",
      })) || []
    );

    if (files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          store.commit(
            "terminal/info",
            i18n.t("alert.extracting-zip", {
              name: "buffer",
            })
          );

          await unzip({
            fs,
            data: await file.arrayBuffer(),
            extractTo: `${join(
              folderExtract,
              basename(file.name, extname(file.name))
            )}`,
            onProgress: (event) => {
              if (event.isDirectory) {
                store.commit(
                  "terminal/print",
                  i18n.t("alert.extract-folder", {
                    name: event.filename,
                  })
                );
              } else {
                store.commit(
                  "terminal/print",
                  i18n.t("alert.extract-file", {
                    name: event.filename,
                  })
                );
              }
            },
          });
        })
      );
    }

    return files.map((item) => item.name);
  };
}
