import selectFile, { fileToBuffer } from "./select-file";
import { join } from "path";
import { unzip } from "./zip";
import { filename } from "@/utils";
import store from "@/store";
import $i18n from "@/plugins/i18n";

export default async function importZip(folderExtract, directory) {
  store.commit("terminal/print", $i18n.t("Import file(s)"));
  const files = await selectFile(".zip");

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file) => {
        await unzip({
          file: await fileToBuffer(file),
          to: `${join(folderExtract, filename(file.name))}`,
          directory,
        });
      })
    );
  }

  return files.map((item) => item.name);
}
