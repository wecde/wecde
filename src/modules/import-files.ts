import { i18n } from "boot/i18n";
import fileToArraybuffer from "file-to-array-buffer";
import { join } from "path-cross";
import { store } from "src/store";

import { writeFile } from "./filesystem";
import selectFile from "./select-file";

export default async function importFiles(
  folderSave: string,
  multiple = true
): Promise<readonly string[]> {
  store.commit("terminal/print", i18n.global.t("alert.import-files"));
  const files = await selectFile("", multiple);

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file, index) => {
        store.commit(
          "terminal/print",
          i18n.global.t("alert.saving-file-index", {
            name: file.name,
            index: index + 1,
            length: files.length,
          })
        );
        await writeFile(
          join(folderSave, file.name),
          await fileToArraybuffer(file)
        );
      })
    );
  }

  return files.map((item) => item.name);
}
