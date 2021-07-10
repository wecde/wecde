import * as MaterialIcons from "./material-icons.json";
import { extname } from "@/utils";
import { basename } from "path";

function getIconById(id: string): string {
  return require(__dirname +
    "/../" +
    MaterialIcons["iconDefinitions"][id].iconPath);
}

export default function getIcon({
  light,
  isOpen,
  isFolder,
  name,
  language = "",
}: {
  light: boolean;
  isOpen: boolean;
  isFolder: boolean;
  name: string;
  language?: string;
}): string {
  let id;
  const ext = extname(name),
    ext2 = basename(name).split(".").slice(-2).join(".");

  if (isFolder) {
    if (light) {
      if (isOpen) {
        id = MaterialIcons.light.folderNamesExpanded[name];
      }

      id = id ?? MaterialIcons.light.folderNames[name];
    }

    if (isOpen) {
      id = MaterialIcons.folderNamesExpanded[name];
    }

    id =
      id ??
      MaterialIcons.folderNames[name] ??
      MaterialIcons.languageIds[language] ??
      (isOpen ? "folder-open" : "folder");
  } else {
    if (light) {
      id =
        MaterialIcons.light.fileNames[name] ??
        MaterialIcons.light.fileExtensions[ext];
    }

    id =
      MaterialIcons.fileNames[name] ??
      MaterialIcons.fileExtensions[ext2] ??
      MaterialIcons.fileExtensions[ext] ??
      MaterialIcons.languageIds[language] ??
      (ext2 in MaterialIcons.iconDefinitions
        ? ext2
        : ext in MaterialIcons.iconDefinitions
        ? ext
        : null) ??
      "file";
  }

  return getIconById(id);
}
