import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { basename } from "path";
import { sort } from "fast-sort";

export async function readdir(path, directory = Directory.Documents) {
  try {
    return await Filesystem.readdir({
      path: `Shin Code Editor/${path}`,
      directory,
    });
  } catch {
    return {
      files: [],
    };
  }
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

export async function writeFile(
  path,
  data,
  encoding = Encoding.UTF8,
  directory = Directory.Documents
) {
  await Filesystem.writeFile({
    path: `Shin Code Editor/${path}`,
    directory,
    data,
    encoding,
    recursive: true,
  });
}

export async function readFile(
  path,
  encoding = Encoding.UTF8,
  directory = Directory.Documents
) {
  return await Filesystem.readFile({
    path: `Shin Code Editor/${path}`,
    directory,
    encoding,
  });
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
    ).files.map(async (file) => {
      return {
        file,
        directory,
        stat: await stat(`${path}/${file}`, directory),
      };
    })
  );
}

export async function readTreeFolder(
  path,
  directory = Directory.Documents,
  indexG = 0
) {
  const tree = [];
  let countFile = 0;
  await Promise.all(
    (
      await readdirStat(path)
    ).map(async ({ file, stat }, index) => {
      if (stat.type === "file") {
        tree.push({
          name: file,
          file: `${path}/${file}`,
          isFolder: false,
          index: indexG + index,
          stat,
        });
        countFile++;
      } else {
        const { children, countFile: countOnChildren } = await readTreeFolder(
          `${path}/${file}`,
          directory,
          index
        );
        tree.push({
          name: file,
          file: `${path}/${file}`,
          index,
          children,
          isFolder: true,
          stat,
        });
        countFile += countOnChildren;
      }
    })
  );

  const listFolders = [];
  const listFiles = [];

  tree.forEach((item) => {
    if (item.stat.type === "directory") {
      listFolders.push(item);
    } else {
      listFiles.push(item);
    }
  });

  tree.splice(0);
  tree.push(
    ...sort(listFolders).asc((item) => item.name),
    ...sort(listFiles).asc((item) => item.name)
  );

  return {
    file: basename(path),
    uri: path,
    children: tree,
    index: indexG,
    countFile,
  };
}

function isBase64(str) {
  if (typeof str !== "string" || str === "" || str.trim() === "") {
    return false;
  }
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

export async function readFilesFolder(path, directory = Directory.Documents) {
  const thisChildren = await Promise.all(
    (
      await readdir(path)
    ).files.map(async (item) => {
      const thisStat = await stat(`${path}/${item}`, directory);

      const data =
        thisStat.type === "file"
          ? await readFile(`${path}/${item}`, directory)
          : null;

      return [
        {
          key: `${path}/${item}`,
          value: {
            file: {
              stat: thisStat,
              data,
              isBase64: isBase64(data),
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
