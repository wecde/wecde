import * as MaterialIcons from "./material-icons.json";
import { extname } from "path";

function getIconById(id) {
  return require(__dirname +
    "/../" +
    MaterialIcons["iconDefinitions"][id].iconPath);
}

export default function getIcon({ light, isOpen, isFolder, name, language }) {
  let id,
    ext = extname(name).replace(/^\./, "");

  if (isFolder) {
    if (light) {
      if (isOpen) {
        id = MaterialIcons.light.folderNamesExpanded[name];
      }

      id = id ?? MaterialIcons.light.folderNames[name] ?? "root-folder";
    }

    if (isOpen) {
      id = MaterialIcons.folderNamesExpanded[name];
    }

    id =
      id ??
      MaterialIcons.folderNames[name] ??
      MaterialIcons.languageIds[language] ??
      "root-folder";
  } else {
    if (light) {
      id =
        MaterialIcons.light.fileNames[name] ??
        MaterialIcons.light.fileExtensions[ext];
    }

    id =
      MaterialIcons.fileNames[name] ??
      MaterialIcons.fileExtensions[ext] ??
      (ext in MaterialIcons.iconDefinitions ? ext : null) ??
      "file";
  }
  return getIconById(id);
}
