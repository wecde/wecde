import selectFile, { fileToBuffer } from "./select-file";
import { join } from "path";
import { unzip } from "./zip";
import { filename } from "@/utils";
import store from "@/store";

export default async function importZip(folderExtract, directory) {
  store.commit("terminal/print", `Import file(s)...`);
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
}
