import { extname, basename } from "path";
import { zip } from "@/modules/zip";
import saveFile from "file-saver";
import store from "@/store";

export default async function exportZip(path, directory) {
  const fileZip = await zip({
    folder: path,
    to: false,
    exclude: [".git"],
    directory,
  });

  const filename = `${basename(path, extname(path))}.zip`;

  store.commit("terminal/print", `Saving file "${filename}"`);

  saveFile(new Blob([fileZip]), filename);

  store.commit("terminal/print", "Done");
}
