import { i18n } from "boot/i18n";
import { basename, extname, join } from "path-cross";
import { store } from "src/store";

import selectFile, { fileToBuffer } from "./select-file";
import { unzip } from "./zip";

export default async function importZip(
  folderExtract: string
): Promise<readonly string[]> {
  store.commit("terminal/print", i18n.global.t("alert.import-files"));
  const files = await selectFile(".zip");

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file) => {
        await unzip(
          await fileToBuffer(file),
          `${join(folderExtract, basename(file.name, extname(file.name)))}`
        );
      })
    );
  }

  return files.map((item) => item.name);
}
