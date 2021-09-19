import { WebServer } from "@ionic-native/web-server";
import { btoa } from "js-base64";
import fs from "modules/fs";
import { extname, join } from "path-cross";
import { boot } from "quasar/wrappers";

boot(({ store }) => {
  const eruda2 = document.createElement("script");
  eruda2.setAttribute("type", "text/javascript");
  eruda2.setAttribute(
    "src",
    `data:application/javascript;base64,${btoa(
      unescape(
        encodeURIComponent(
          require("!raw-loader!eruda2/eruda.js") +
            ';eruda.init({useShadowDom:true,autoScale:true,defaults:{displaySize:50,transparency:0.9,theme:"Monokai Pro"}});'
        )
      )
    )}`
  );
  eruda2.setAttribute("id", "eruda-loader");

  function addEruda(html: string): string {
    const virualDOM = new DOMParser().parseFromString(html, "text/html");
    virualDOM.head.prepend(eruda2.cloneNode(true));

    return virualDOM.documentElement.outerHTML;
  }

  try {
    WebServer.onRequest().subscribe(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (data) => {
        /// get project

        const { project } = store.state.editor;

        // const webserverConfig = join(`projects/${project}`, "webserver.config");

        // let webserverConfigJSON;

        // if (await stat(webserverConfig + ".js")) {
        //   webserverConfigJSON = new Function(
        //     rawText(await readFile(webserverConfig + ".js")).replace(
        //       /export default/,
        //       "return"
        //     )
        //   )();
        // } else if (await stat(webserverConfig + ".json")) {
        //   webserverConfigJSON = JSON.parse(await readFile(webserverConfig + ".json"));
        // } else {
        //   webserverConfigJSON = {};
        // }

        try {
          if (!project) {
            // eslint-disable-next-line functional/no-throw-statement
            throw new Error("NOT_FOUND");
          }

          const path = join(project as string, data.path.slice(1));

          const thisStat = await fs.stat(path);

          if (thisStat) {
            // eslint-disable-next-line functional/no-let
            let pathToFile = path;

            if (thisStat.isDirectory()) {
              pathToFile = join(path, "index.html");
            }

            if (await fs.stat(pathToFile)) {
              if (/^\.html?$/.test(extname(pathToFile))) {
                await WebServer.sendResponse(data.requestId, {
                  status: 200,
                  body: data.headers
                    .split("\n")
                    .find((item) => item.startsWith("HTTP_X_REQUESTED_WITH: "))
                    ?.includes("xmlhttprequest")
                    ? await fs.readFile(pathToFile, "utf8")
                    : addEruda(await fs.readFile(pathToFile, "utf8")),
                  headers: {
                    "Content-Type": "text/html",
                  },
                });
              } else {
                await WebServer.sendResponse(data.requestId, {
                  status: 201,
                  path: await fs.getUri(pathToFile),
                  headers: {},
                });
              }
            } else {
              // eslint-disable-next-line functional/no-throw-statement
              throw new Error("NOT_FOUND");
            }
          } else {
            // eslint-disable-next-line functional/no-throw-statement
            throw new Error("NOT_FOUND");
          }
        } catch {
          await WebServer.sendResponse(data.requestId, {
            status: 404,
            path: require("!raw-loader!src/webserver/404.html"),
            headers: {},
          });
        }
      }
    );
  } catch {
    console.warn("WebServer not available.");
  }
});
