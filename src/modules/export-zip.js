import { extname, basename } from "path";
import { zip } from "@/modules/zip";
import saveFile from "file-saver";
import store from "@/store";
import $i18n from "@/plugins/i18n";

export default async function exportZip(path, directory) {
  const fileZip = await zip({
    folder: path,
    to: false,
    exclude: [".git"],
    directory,
  });

  const filename = `${basename(path, extname(path))}.zip`;

  store.commit(
    "terminal/print",
    $i18n.t(`Saving file {name}`, {
      name: filename,
    })
  );

  saveFile(new Blob([fileZip]), filename);

  store.commit("terminal/print", "Done");
}
