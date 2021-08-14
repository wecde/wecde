import { i18n } from "boot/i18n";
import { saveAs } from "file-saver";
import { zip } from "modules/zip";
import { basename, extname } from "path-cross";
import { store } from "src/store";

export default async function exportZip(path: string): Promise<void> {
  const fileZip = await zip({
    folder: path,
    to: false,
    exclude: ["^.git"],
  });

  const filename = `${basename(path, extname(path))}.zip`;

  store.commit(
    "terminal/print",
    i18n.global.t("alert.saving-file", {
      name: filename,
    })
  );

  saveAs(new Blob([fileZip]), filename);

  store.commit("terminal/print", i18n.global.t("done"));
}
