import selectFile from "./select-file";
import store from "@/store";
import { writeFile } from "./filesystem";
import fileToArraybuffer from "file-to-array-buffer";

export default async function importFiles(
  folderSave,
  multiple = true,
  directory
) {
  store.commit("terminal/print", `Import file(s)...`);
  const files = await selectFile("", multiple);

  if (files.length > 0) {
    await Promise.all(
      files.map(async (file, index) => {
        this.$store.commit(
          "terminal/print",
          `Saving file "${file.name}" (${index + 1}/${files.length})`
        );
        await writeFile(
          `projects/${folderSave}/${file.name}`,
          await fileToArraybuffer(file),
          directory
        );
      })
    );
  }
}
