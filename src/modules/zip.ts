import { i18n } from "boot/i18n";
import { Stat } from "capacitor-fs/build/main/Stat";
import Ignore from "ignore";
import JSZip from "jszip";
import { join, relative } from "path-cross";
import { store } from "src/store";

import fs from "./fs";

async function globby(
  dir: string,
  ignore: readonly string[],
  root = dir
): Promise<
  readonly {
    readonly path: string;
    readonly stat: Stat;
  }[]
> {
  const list = await fs
    .readdir(dir)
    .then((files) => files.map((item) => relative(root, join(dir, item))));

  const ig = Ignore().add([...ignore]);

  return (
    await Promise.all(
      ig
        .filter(list)
        .map((item) => join(root, item))
        .map(async (item) => {
          const statItem = await fs.stat(item);

          if (statItem.isDirectory()) {
            return [
              {
                path: item,
                stat: statItem,
              },
              ...(await globby(item, ignore, dir)),
            ];
          }

          return [
            {
              path: item,
              stat: statItem,
            },
          ];
        })
    )
  ).flat(2);
}

export async function zip(dir: string, saveZipTo: string): Promise<void>;
export async function zip(dir: string): Promise<ArrayBuffer>;
export async function zip(
  dir: string,
  saveZipTo?: string
): Promise<void | ArrayBuffer> {
  store.commit(
    "terminal/info",
    i18n.global.t("alert.ziping", {
      name: dir,
    })
  );
  const zip = new JSZip();

  const globs = await globby(dir, ["!.git", "!node_modules"]);

  const tasks = globs.map(async ({ path, stat }) => {
    store.commit(
      "terminal/print",
      i18n.global.t(`alert.adding.${stat.type}`, {
        type: stat.type,
        name: path,
      })
    );

    if (stat.isDirectory()) {
      zip.folder(relative(dir, path));
    } else {
      zip.file(relative(dir, path), await fs.readFile(path, "base64"), {
        base64: true,
      });
    }
  });

  await Promise.all(tasks);

  const fileResult = await zip.generateAsync({
    type: "arraybuffer",
  });

  if (saveZipTo) {
    store.commit(
      "terminal/print",
      i18n.global.t("alert.zip-saved", {
        name: saveZipTo,
      })
    );

    await fs.writeFile(saveZipTo, fileResult);
  } else {
    store.commit("terminal/print", i18n.global.t("alert.created.zip"));

    return fileResult;
  }
}

export async function unzip(
  file: string | ArrayBuffer,
  extractTo: string,
  http = false
): Promise<void> {
  store.commit(
    "terminal/info",
    i18n.global.t("alert.extracting-zip", {
      name: typeof file === "string" ? file : "tmp/buffer",
    })
  );

  if (typeof file === "string") {
    if (http) {
      file = await fetch(file)
        .then((res) => res.blob())
        .then((blob) => blob.arrayBuffer());
    } else {
      file = await fs.readFile(file, "buffer");
    }
  }

  const zip = await JSZip.loadAsync(file);

  const tasks = [];

  // eslint-disable-next-line functional/no-loop-statement
  for (const path in zip.files) {
    store.commit(
      "terminal/print",
      i18n.global.t(
        `alert.extract-${zip.files[path].dir ? "folder" : "file"}`,
        {
          name: path,
        }
      )
    );

    if (zip.files[path].dir === false) {
      if (zip.file(path)) {
        // eslint-disable-next-line functional/immutable-data
        tasks.push(
          fs.writeFile(
            join(extractTo, path),
            await (zip.file(path) as JSZip.JSZipObject).async("arraybuffer"),
            {
              recursive: true,
            }
          )
        );
      }
    } else {
      // eslint-disable-next-line functional/immutable-data
      tasks.push(
        fs
          .mkdir(join(extractTo, path), {
            recursive: true,
          })
          .catch(({ code }) => {
            console.log(code);
          })
      );
    }
  }

  await Promise.allSettled(tasks);
  store.commit(
    "terminal/print",
    i18n.global.t("alert.unzipped", {
      extractTo,
    })
  );
}
