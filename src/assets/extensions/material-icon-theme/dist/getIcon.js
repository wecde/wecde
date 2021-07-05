import * as MaterialIcons from "./material-icons.json";
import { extname } from "@/utils";

function getIconById(id) {
  return require(__dirname +
    "/../" +
    MaterialIcons["iconDefinitions"][id].iconPath);
}

export default function getIcon({ light, isOpen, isFolder, name, language }) {
  let id,
    ext = extname(name);

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
      MaterialIcons.fileExtensions[ext] ??
      MaterialIcons.languageIds[language] ??
      (ext in MaterialIcons.iconDefinitions ? ext : null) ??
      "file";
  }

  return getIconById(id);
}
