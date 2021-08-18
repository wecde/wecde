// import MagicPortal from "magic-portal/dist/index.js";
import { proxy, wrap } from "comlink";
import * as helpers from "src/helpers/git";
import GitWorker from "worker-loader!./git.worker";

const worker = new GitWorker();

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).gitWorker = wrap(worker);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).helpers = helpers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
(self as any).proxy = proxy;

// const portal = new MagicPortal(worker);
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// worker.addEventListener("message", (ev: any) => console.log(ev));

// const mainThread = {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/require-await
//   async progress(evt: any) {
//     console.log(evt);
//   },
// };
// portal.set("mainThread", mainThread, {
//   void: ["progress"],
// });

// // eslint-disable-next-line @typescript-eslint/no-misused-promises
// !(async () => {
//   async function doCloneAndStuff(url: string) {
//     await workerThread.setDir("/Shin Code Editor/projects/test");

//     await workerThread.clone({
//       corsProxy: "https://cors.isomorphic-git.org",
//       url,
//     });

//     const branches = await workerThread.listBranches({ remote: "origin" });
//     console.log(branches);
//     const files = await workerThread.listFiles({});
//     console.log(files);

//     const commits = await workerThread.log({});
//     console.log(commits);
//   }
//   const workerThread = await portal.get("workerThread");

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
//   (self as any).workerThread = workerThread;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
//   (self as any).worker = worker;

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/immutable-data
//   (self as any).doCloneAndStuff = doCloneAndStuff;
// })();
