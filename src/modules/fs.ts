
import { Directory, Filesystem } from "@capacitor/filesystem";
import { createFilesystem } from "capacitor-fs";

export default createFilesystem(Filesystem, {
  rootDir: "Shin Code Editor",
  directory: Directory.Documents,
  base64Alway: true,
});
