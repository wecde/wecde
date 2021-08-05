import { Directory } from "@capacitor/filesystem";
import { i18n } from "boot/i18n";
import JSZip from "jszip";
import { join } from "path-cross";
import { store } from "src/store";

import { base64ToArrayBuffer } from "../utils";

import { mkdir, readFile, readFilesFolder, writeFile } from "./filesystem";

export async function zip({
  folder,
  to,
  exclude,
}: {
  readonly folder: string;
  readonly to: string;
  readonly exclude: ReadonlyArray<string | RegExp>;
}): Promise<void>;
export async function zip({
  folder,
  to,
  exclude,
}: {
  readonly folder: string;
  readonly to: false;
  readonly exclude: ReadonlyArray<string | RegExp>;
}): Promise<ArrayBuffer>;
export async function zip({
  folder,
  to,
  exclude = [],
}: {
  readonly folder: string;
  readonly to: string | false;
  readonly directory?: Directory;
  readonly toDirectory?: Directory;
  readonly exclude: ReadonlyArray<string | RegExp>;
}): Promise<ArrayBuffer | void> {
  console.log(store);
  store.commit(
    "terminal/print",
    i18n.global.rt("Ziping folder {name}", {
      name: folder,
    })
  );
  const zip = new JSZip();
  (await readFilesFolder(folder, exclude)).forEach(
    ({ key: path, value: { stat, data } }) => {
      if (path.startsWith(folder)) {
        path = path.replace(folder, "").replace(/^\//g, "");
      }

      store.commit(
        "terminal/print",
        i18n.global.rt("Adding {type} {name}", {
          type: stat.type,
          name: path,
        })
      );
      if (stat.type === "directory") {
        zip.folder(path);
      } else {
        zip.file(path, data ?? "", {
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
      i18n.global.rt("Successfully zip saved in {name}", {
        name: to,
      })
    );

    await writeFile(to, fileResult);
  }

  store.commit("terminal/print", i18n.global.rt("Successfully created zip"));

  return fileResult;
}

export async function unzip({
  file,
  to,
}: {
  readonly file: string | ArrayBuffer;
  readonly to: string;
}): Promise<void> {
  console.log(store);
  store.commit(
    "terminal/print",
    i18n.global.rt("Getting file zip from {name}", {
      name: typeof file === "string" ? file : "tmp/buffer",
    })
  );

  const zip = await JSZip.loadAsync(
    typeof file === "string"
      ? /^(?:(?:https?:\/\/)|\/)/.exec(file)
        ? await fetch(file)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
        : base64ToArrayBuffer(await readFile(file))
      : file
  );

  store.commit(
    "terminal/print",
    i18n.global.rt("Extract file {name}", {
      name: typeof file === "string" ? file : "tmp/buffer",
    })
  );
  const allProcess = [];

  // eslint-disable-next-line functional/no-loop-statement
  for (const path in zip.files) {
    store.commit(
      "terminal/print",
      i18n.global.rt("Extracing {type} {name}", {
        type: i18n.global.rt(zip.files[path].dir ? "directory" : "file"),
        name: path,
      })
    );

    if (zip.files[path].dir === false) {
      if (zip.file(path)) {
        // eslint-disable-next-line functional/immutable-data
        allProcess.push(
          writeFile(
            join(to, path),

            await (zip.file(path) as JSZip.JSZipObject).async("arraybuffer")
          )
        );
      }
    } else {
      // eslint-disable-next-line functional/immutable-data
      allProcess.push(mkdir(join(to, path)));
    }
  }

  await Promise.all(allProcess);
  store.commit(
    "terminal/print",
    i18n.global.rt("Extracted zip to {to}", {
      to,
    })
  );
}
