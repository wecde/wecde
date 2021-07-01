import { extname as _extname, basename } from "path";
import { zip } from "@/modules/zip";
import saveFile from "file-saver";

export function extname(path) {
  return _extname(path).replace(/^\./g, "");
}

export async function exportZip(path) {
  const fileZip = await zip({
    folder: path,
    to: false,
    exclude: [".git"],
    directory: this.project.directory,
  });

  saveFile(new Blob([fileZip]), `${basename(path, _extname(path))}.zip`);
}

export function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
