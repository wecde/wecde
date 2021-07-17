import { extname, basename } from "path";
import { zip } from "@/modules/zip";
import { saveAs } from "file-saver";
import store from "@/store";
import i18n from "@/i18n";
import { Directory } from "@capacitor/filesystem";

export default async function exportZip(
  path: string,
  directory?: Directory
): Promise<void> {
  const fileZip = await zip({
    folder: path,
    to: false,
    exclude: ["^.git"],
    directory,
  });

  const filename = `${basename(path, extname(path))}.zip`;

  store.commit(
    "terminal/print",
    i18n.t(`Saving file {name}`, {
      name: filename,
    })
  );

  saveAs(new Blob([fileZip]), filename);

  store.commit("terminal/print", i18n.t("Done") as string);
}
