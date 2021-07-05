import selectFile from "./select-file";
import store from "@/store";
import { writeFile } from "./filesystem";
import fileToArraybuffer from "file-to-array-buffer";
import $i18n from "@/plugins/i18n";

export default async function importFiles(
  folderSave,
  multiple = true,
  directory
) {
  store.commit("terminal/print", $i18n.t("Import file(s)"));
  const files = await selectFile("", multiple);

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file, index) => {
        this.$store.commit(
          "terminal/print",
          $i18n.t("Saving file {name} {index}/{length}", {
            name: file.name,
            index: index + 1,
            length: files.length,
          })`Saving file "${file.name}" (${index + 1}/${files.length})`
        );
        await writeFile(
          `projects/${folderSave}/${file.name}`,
          await fileToArraybuffer(file),
          directory
        );
      })
    );
  }

  return files.map((item) => item.name);
}
