import selectFile from "./select-file";
import store from "@/store";
import { writeFile } from "./filesystem";
import fileToArraybuffer from "file-to-array-buffer";
import i18n from "@/i18n";
import { Directory } from "@capacitor/filesystem";
import { join } from "path";

export default async function importFiles(
  folderSave: string,
  multiple = true,
  directory?: Directory
): Promise<string[]> {
  store.commit("terminal/print", i18n.t("Import file(s)"));
  const files = await selectFile("", multiple);

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file, index) => {
        store.commit(
          "terminal/print",
          i18n.t("Saving file {name} {index}/{length}", {
            name: file.name,
            index: index + 1,
            length: files.length,
          })
        );
        await writeFile(
          join(folderSave, file.name),
          await fileToArraybuffer(file),
          directory
        );
      })
    );
  }

  return files.map((item) => item.name);
}
