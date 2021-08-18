// eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
(self as any).window = self;

/* eslint-env worker */
import FS from "capacitor-fs";
import { expose } from "comlink";
import git, {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  MessageCallback,
  ProgressCallback,
} from "isomorphic-git-cross";
import http from "isomorphic-git-cross/http/web/index.js";

const fs = new FS({
  rootDir: "/",
  base64Alway: true,
});

expose({
  async clone(
    param: {
      readonly onAuth?: AuthCallback | undefined;
      readonly onAuthFailure?: AuthFailureCallback | undefined;
      readonly onAuthSuccess?: AuthSuccessCallback | undefined;
      readonly dir: string;
      readonly url: string;
      readonly corsProxy?: string | undefined;
      readonly ref?: string | undefined;
      readonly singleBranch?: boolean | undefined;
      readonly noCheckout?: boolean | undefined;
      readonly noTags?: boolean | undefined;
      readonly remote?: string | undefined;
      readonly depth?: number | undefined;
      readonly since?: Date | undefined;
      // eslint-disable-next-line functional/prefer-readonly-type
      readonly exclude?: string[] | undefined;
      readonly relative?: boolean | undefined;
      // eslint-disable-next-line functional/prefer-readonly-type
      readonly headers?: { [x: string]: string } | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly cache?: any | undefined;
    },
    onMessage?: MessageCallback,
    onProgress?: ProgressCallback
  ): Promise<void> {
    await git.clone({
      fs,
      http,
      onMessage,
      onProgress,
      ...param,
    });
  },
});
// const portal = new MagicPortal(self);
// self.addEventListener("message", ({ data }) => console.log(data));

// // eslint-disable-next-line @typescript-eslint/no-misused-promises
// !(async () => {
//   const mainThread = await portal.get("mainThread");
//   // eslint-disable-next-line functional/no-let
//   let dir = "/";
//   portal.set("workerThread", {
//     // eslint-disable-next-line @typescript-eslint/require-await
//     setDir: async (_dir: string) => {
//       dir = _dir;
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     clone: async (args: any) => {
//       return git.clone({
//         ...args,
//         fs,
//         http,
//         dir,
//         onProgress(evt) {
//           mainThread.progress(evt);
//         },
//         onMessage(msg) {
//           mainThread.progress(msg);
//         },
//         onAuth(url) {
//           console.log(url);
//           return mainThread.progress(url);
//         },
//         onAuthFailure(ev) {
//           return mainThread.rejected(ev);
//         },
//       });
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     listBranches: async (args: any) => git.listBranches({ ...args, fs, dir }),
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     listFiles: async (args: any) => git.listFiles({ ...args, fs, dir }),
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     log: async (args: any) => git.log({ ...args, fs, dir }),
//   });
// })();
