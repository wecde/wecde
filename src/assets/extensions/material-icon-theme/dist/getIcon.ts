import { basename, extname } from "path-cross";

import MaterialIcons from "./material-icons.json";

function getIconById(id: keyof typeof MaterialIcons.iconDefinitions): string {
  return require(__dirname +
    "/../" +
    MaterialIcons.iconDefinitions[id].iconPath);
}

export default function getIcon({
  light,
  isOpen,
  isFolder,
  name,
  language = "",
}: {
  readonly light: boolean;
  readonly isOpen: boolean;
  readonly isFolder: boolean;
  readonly name: string;
  readonly language?: string;
}): string {
  // eslint-disable-next-line functional/no-let
  let id;
  const ext = extname(name).replace(/^\./, ""),
    ext2 = name.includes(".")
      ? basename(name).split(".").slice(-2).join(".")
      : "";

  if (isFolder) {
    if (light) {
      if (isOpen) {
        id =
          name in MaterialIcons.light.folderNamesExpanded
            ? MaterialIcons.light.folderNamesExpanded[
                name as keyof typeof MaterialIcons.light.folderNamesExpanded
              ]
            : undefined;
      }

      id =
        id ??
        MaterialIcons.light.folderNamesExpanded[
          name as keyof typeof MaterialIcons.light.folderNamesExpanded
        ];
    }

    if (isOpen) {
      id =
        MaterialIcons.folderNamesExpanded[
          name as keyof typeof MaterialIcons.folderNamesExpanded
        ];
    }

    id =
      id ??
      MaterialIcons.folderNames[
        name as keyof typeof MaterialIcons.folderNames
      ] ??
      MaterialIcons.languageIds[
        language as keyof typeof MaterialIcons.languageIds
      ] ??
      (isOpen ? "folder-open" : "folder");
  } else {
    if (light) {
      id =
        MaterialIcons.light.fileNames[
          name as keyof typeof MaterialIcons.light.fileNames
        ] ??
        MaterialIcons.light.fileExtensions[
          ext as keyof typeof MaterialIcons.light.fileExtensions
        ];
    }

    id =
      MaterialIcons.fileNames[name as keyof typeof MaterialIcons.fileNames] ??
      MaterialIcons.fileExtensions[
        ext2 as keyof typeof MaterialIcons.fileExtensions
      ] ??
      MaterialIcons.fileExtensions[
        ext as keyof typeof MaterialIcons.fileExtensions
      ] ??
      MaterialIcons.languageIds[
        language as keyof typeof MaterialIcons.languageIds
      ] ??
      (ext2 in MaterialIcons.iconDefinitions
        ? ext2
        : ext in MaterialIcons.iconDefinitions
        ? ext
        : null) ??
      "file";
  }

  return getIconById(id as keyof typeof MaterialIcons.iconDefinitions);
}
