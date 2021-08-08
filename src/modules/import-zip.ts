import { i18n } from "boot/i18n";
import { join } from "path-cross";
import { store } from "src/store";
import { filename } from "src/utils";

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
        await unzip({
          file: await fileToBuffer(file),
          to: `${join(folderExtract, filename(file.name))}`,
        });
      })
    );
  }

  return files.map((item) => item.name);
}
