import { i18n } from "boot/i18n";
import fs from "modules/fs";
import { basename, extname, join } from "path-cross";
import selectFiles from "select-files";
import { store } from "src/store";
import { unzip } from "zip2";

export default async function createProjectFromZip(
  folderExtract: string
): Promise<readonly string[]> {
  store.commit("terminal/print", i18n.global.t("alert.import-files"));
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
          i18n.global.t("alert.extracting-zip", {
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
                i18n.global.t("alert.extract-folder", {
                  name: event.filename,
                })
              );
            } else {
              store.commit(
                "terminal/print",
                i18n.global.t("alert.extract-file", {
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
}
