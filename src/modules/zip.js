import JSZip from "jszip";
import { readFilesFolder, writeFile, readFile, mkdir } from "./filesystem";
import { join } from "path";
import store from "@/store";
import { base64ToArrayBuffer } from "../utils";

export async function zip({
  folder,
  to,
  directory,
  toDirectory,
  exclude = [],
}) {
  store.commit("terminal/print", `Ziping folder "${folder}"`);
  const zip = new JSZip();

  (await readFilesFolder(folder, directory)).forEach(
    ({
      key: path,
      value: {
        file: {
          stat: { type },
          data,
        },
      },
    }) => {
      if (path.startsWith(folder)) {
        path = path.replace(folder, "").replace(/^\//g, "");
      }

      if (
        path.split("/").some((item) => {
          return exclude.some((regexp) => !!item.match(regexp));
        })
      ) {
        return [];
      }

      store.commit("terminal/print", `Adding ${type} "${path}"...`);
      if (type === "directory") {
        zip.folder(path);
      } else {
        zip.file(path, data ?? null, {
          base64: true,
        });
      }
    }
  );

  const fileResult = await zip.generateAsync({
    type: "arraybuffer",
  });

  if (to) {
    store.commit("terminal/print", `Successfuly zip saved in "${to}"`);

    await writeFile(to, fileResult, toDirectory);
  }

  store.commit("terminal/print", `Successfuly created zip.`);

  return fileResult;
}

export async function unzip({ file, to, directory, toDirectory }) {
  store.commit(
    "terminal/print",
    `Geting file zip from "${
      typeof file === "string" ? file : "tmp/buffer"
    }"...`
  );

  const zip = await JSZip.loadAsync(
    typeof file === "string"
      ? file.match(/^(?:https?:\/\/|\/)/)
        ? await fetch(file)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
        : base64ToArrayBuffer(await readFile(file, directory))
      : file
  );
  store.commit("terminal/print", `Extract file "${file}"...`);
  const allProcess = [];

  for (const path in zip.files) {
    store.commit(
      "terminal/print",
      `Extracing ${zip.files[path].dir ? "directory" : "file"} "${path}"`
    );

    if (zip.files[path].dir === false) {
      allProcess.push(
        writeFile(
          join(to, path),
          await zip.file(path).async("arraybuffer"),
          toDirectory
        )
      );
    } else {
      allProcess.push(mkdir(join(to, path), toDirectory));
    }
  }

  await Promise.all(allProcess);
  store.commit("terminal/print", `Extracted zip to "${to}"`);
}
