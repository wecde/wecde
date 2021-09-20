import { Directory, Filesystem } from "@capacitor/filesystem";
import { createFilesystem } from "capacitor-fs";

const fs = createFilesystem(Filesystem, {
  rootDir: "Shin Code Editor",
  directory: Directory.Documents,
  base64Alway: true,
});

if (process.env.NODE_ENV === "development") {
  fs.on("write:file", (p) => console.log(`write ${p}`));
}

export default fs;
