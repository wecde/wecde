import JSZip from "jszip";
import { readFilesFolder, writeFile, readFile, mkdir } from "./filesystem";
import { join } from "path";
import store from "@/store";
import { base64ToArrayBuffer } from "../utils";
import $i18n from "@/plugins/i18n";

export async function zip({
  folder,
  to,
  directory,
  toDirectory,
  exclude = [],
}) {
  store.commit(
    "terminal/print",
    $i18n.t(`Ziping folder {name}`, {
      name: folder,
    })
  );
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

      store.commit(
        "terminal/print",
        $i18n.t("Adding {type} {name}", {
          type,
          name: path,
        })
      );
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
    store.commit(
      "terminal/print",
      $i18n.t("Successfuly zip saved in {name}", {
        name: to,
      })
    );

    await writeFile(to, fileResult, toDirectory);
  }

  store.commit("terminal/print", $i18n.t(`Successfuly created zip`));

  return fileResult;
}

export async function unzip({ file, to, directory, toDirectory }) {
  store.commit(
    "terminal/print",
    $i18n.t(`Geting file zip from {name}`, {
      name: typeof file === "string" ? file : "tmp/buffer",
    })
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
  store.commit(
    "terminal/print",
    $i18n.t("Extract file {name}", {
      name: typeof file === "string" ? file : "tmp/buffer",
    })
  );
  const allProcess = [];

  for (const path in zip.files) {
    store.commit(
      "terminal/print",
      $i18n.t("Extracing {type} {name}", {
        type: zip.files[path].dir ? "directory" : "file",
        name: path,
      })
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
  store.commit(
    "terminal/print",
    $i18n.t(`Extracted zip to {to}`, {
      to,
    })
  );
}
