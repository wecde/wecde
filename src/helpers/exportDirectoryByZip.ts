import { i18n } from "boot/i18n";
import { saveAs } from "file-saver";
import fs from "modules/fs";
import { basename } from "path-cross";
import { store } from "src/store";
import { zip } from "zip2";

export default async function exportZip(path: string): Promise<void> {
  store.commit(
    "terminal/info",
    i18n.global.t("alert.ziping", {
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
          i18n.global.t("alert.adding.directory", {
            name: path,
          })
        );
      } else {
        store.commit(
          "terminal/print",
          i18n.global.t("alert.adding.file", {
            name: path,
          })
        );
      }
    },
  });

  store.commit(
    "terminal/print",
    i18n.global.t("alert.saving-file", {
      name: basename(path) + ".zip",
    })
  );

  saveAs(new Blob([buffer]), basename(path) + ".zip");
}
