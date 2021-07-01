import JSZip from "jszip";
import { readFilesFolder, writeFile, readFile } from "./filesystem";
import { join } from "path";

function isASCII(str) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}

function checkUTF8(text) {
  try {
    decodeURIComponent(escape(text));

    return true;
  } catch {
    return false;
  }
}

export async function zip({
  folder,
  to,
  directory,
  toDirectory,
  exclude = [],
}) {
  const zip = new JSZip();
  (await readFilesFolder(folder, directory)).forEach(
    ({
      key: path,
      value: {
        file: {
          stat: { type },
          data,
          isBase64,
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

      if (type === "directory") {
        zip.folder(path);
      } else {
        zip.file(path, data?.data ?? null, {
          base64: isBase64,
        });
      }
    }
  );

  const fileResult = await zip.generateAsync({
    type: "arraybuffer",
  });

  if (to) {
    await writeFile(
      to,
      btoa(String.fromCharCode(...new Uint8Array(fileResult))),
      null,
      toDirectory
    );
  }

  return fileResult;
}

function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function unzip({ file, to, directory, toDirectory }) {
  const zip = await JSZip.loadAsync(
    typeof file === "string"
      ? file.match(/^(?:https?:\/\/|\/)/)
        ? await fetch(file)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
        : Uint8Array.from(
            atob(await (await readFile(file, directory)).data),
            (c) => c.charCodeAt(0)
          )
      : file
  );

  const allProcess = [];

  for (const path in zip.files) {
    if (zip.files[path].dir === false) {
      const text = await zip.file(path).async("text");

      if (isASCII(text) || checkUTF8(text)) {
        /// is plain/text

        allProcess.push(
          writeFile(join(to, path), text, undefined, toDirectory)
        );
      } else {
        allProcess.push(
          writeFile(
            join(to, path),
            _arrayBufferToBase64(await zip.file(path).async("arraybuffer")),
            "base64",
            toDirectory
          )
        );
      }
    }
  }

  await Promise.all(allProcess);
}
