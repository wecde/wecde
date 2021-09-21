import { Directory, Filesystem } from "@capacitor/filesystem";
import { createFilesystem } from "capacitor-fs";

const fs = createFilesystem(Filesystem, {
  rootDir: "Wecde",
  directory: Directory.Documents,
  base64Alway: true,
});

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
  (window as any).fs = fs;
  fs.on("write:file", (p) => console.log(`write ${p}`));
}

export default fs;
