import { Filesystem, Directory } from "@capacitor/filesystem";
import { alwayBase64 } from "@/utils";
import { arrayBufferToBase64 } from "../utils";
import { basename } from "path";
import { sort as fastsort } from "fast-sort";

export async function readdir(path, directory = Directory.Documents) {
  return (
    await Filesystem.readdir({
      path: `Shin Code Editor/${path}`,
      directory,
    })
  ).files;
}

export async function mkdir(path, directory = Directory.Documents) {
  try {
    await Filesystem.mkdir({
      path: `Shin Code Editor/${path}`,
      directory,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {}
}

export async function rmdir(path, directory = Directory.Documents) {
  try {
    await Filesystem.rmdir({
      path: `Shin Code Editor/${path}`,
      directory,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {}
}
/**
 *
 * todo: not support base64
 */
export async function writeFile(path, data, directory = Directory.Documents) {
  if (data instanceof ArrayBuffer) {
    data = arrayBufferToBase64(data);
  } else if (data instanceof Uint8Array) {
    data = Buffer.from(data).toString("base64");
  } else if (data instanceof Blob) {
    data = arrayBufferToBase64(await data.arrayBuffer());
  } else {
    data = btoa(data);
  }

  try {
    await Filesystem.writeFile({
      path: `Shin Code Editor/${path}`,
      directory,
      data,
      recursive: true,
    });
    // eslint-disable-next-line no-empty
  } catch {
    try {
      await Filesystem.writeFile({
        path: `Shin Code Editor/${path}`,
        directory,
        data,
        recursive: false,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

export async function readFile(path, directory = Directory.Documents) {
  const { data } = await Filesystem.readFile({
    path: `Shin Code Editor/${path}`,
    directory,
  });

  return alwayBase64(data);
}

export async function unlink(path, directory = Directory.Documents) {
  const { type } = await Filesystem.stat({
    path: `Shin Code Editor/${path}`,
    directory,
  });

  if (type === "directory") {
    await rmdir(path);
  } else {
    await Filesystem.deleteFile({
      path: `Shin Code Editor/${path}`,
      directory,
    });
  }
}

export async function rename(
  from,
  to,
  directory = Directory.Documents,
  toDirectory = Directory.Documents
) {
  /// fix error
  const { startsWith } = String.prototype;
  String.prototype.startsWith = () => false;
  await Filesystem.rename({
    from: `Shin Code Editor/${from}`,
    to: `Shin Code Editor/${to}`,
    directory,
    toDirectory,
  });
  String.prototype.startsWith = startsWith;
}

export async function copy(
  from,
  to,
  directory = Directory.Documents,
  toDirectory = Directory.Documents
) {
  await Filesystem.copy({
    from: `Shin Code Editor/${from}`,
    to: `Shin Code Editor/${to}`,
    directory,
    toDirectory,
  });
}

export async function stat(path, directory = Directory.Documents) {
  return await Filesystem.stat({
    path: `Shin Code Editor/${path}`,
    directory,
  });
}

export async function readdirStat(path, directory = Directory.Documents) {
  return await Promise.all(
    (
      await readdir(path, directory)
    ).map(async (file) => {
      return {
        file,
        directory,
        stat: await stat(`${path}/${file}`, directory),
      };
    })
  );
}

export async function readTreeFolder(path, directory = Directory.Documents) {
  const tree = [];

  await Promise.all(
    (
      await readdirStat(path)
    )
      .filter(({ file, stat: { type } }) => {
        return type !== "directory" || file !== ".git";
      })
      .map(async ({ file, stat }) => {
        if (stat.type === "file") {
          tree.push({
            name: file,
            file: `${path}/${file}`,
            isFolder: false,
            stat,
          });
        } else {
          const { children, isFolder } = await readTreeFolder(
            `${path}/${file}`,
            directory
          );
          tree.push({
            name: file,
            file: `${path}/${file}`,
            children,
            isFolder,
            stat,
          });
        }
      })
  );

  const files = [];
  const folders = [];
  tree.forEach((item) => {
    if (item.isFolder) {
      folders.push(item);
    } else {
      files.push(item);
    }
  });

  tree.splice(0);
  tree.push(
    ...fastsort(folders).asc((item) => item.name),
    ...fastsort(files).asc((item) => item.name)
  );

  return {
    name: basename(path),
    file: path,
    children: tree,
    isFolder: true,
  };
}

export async function readFilesFolder(path, directory = Directory.Documents) {
  const thisChildren = await Promise.all(
    (
      await readdir(path)
    ).map(async (item) => {
      const thisStat = await stat(`${path}/${item}`, directory);
      let data = null;

      if (thisStat.type === "file" || thisStat.type === "link") {
        data = await readFile(`${path}/${item}`, directory);
      }

      return [
        {
          key: `${path}/${item}`,
          value: {
            file: {
              stat: thisStat,
              data,
            },
          },
        },
        ...(thisStat.type === "directory"
          ? await readFilesFolder(`${path}/${item}`, directory)
          : []),
      ];
    })
  );

  return thisChildren.flat(2);
}

export async function requestPermissions() {
  if ((await Filesystem.checkPermissions()) !== "granted") {
    await Filesystem.requestPermissions();
  }
}

export async function getUri(path, directory = Directory.Documents) {
  return decodeURIComponent(
    (
      await Filesystem.getUri({
        path: `Shin Code Editor/${path}`,
        directory,
      })
    ).uri
  ).replace(/^[a-z]+:\/\//, "");
}
