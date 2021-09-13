
import { Directory, Filesystem } from "@capacitor/filesystem";
import { createFilesystem } from "capacitor-fs";
import git from "isomorphic-git"

const fs = createFilesystem(Filesystem, {
  rootDir: "Shin Code Editor",
  directory: Directory.Documents,
  base64Alway: true,
});



// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(window as any).fs = fs;
// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(window as any).git = git;

fs.on("write:file", p => console.log(`write ${p}`))

export default fs;