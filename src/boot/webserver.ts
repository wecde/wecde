import { WebServer } from "@ionic-native/web-server";
import { btoa } from "js-base64";
import fs from "modules/fs";
import { extname, join } from "path-cross";
import { boot } from "quasar/wrappers";

export default boot(({ store }) => {
  const eruda2 = document.createElement("script");
  eruda2.setAttribute("type", "text/javascript");
  eruda2.setAttribute(
    "src",
    `data:application/javascript;base64,${btoa(
      unescape(
        encodeURIComponent(
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require("!raw-loader!eruda2/eruda.js").default +
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

  console.log("Installed Webserver");

  WebServer.onRequest().subscribe(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (data) => {
      /// get project

      const { project } = store.state.editor;

      try {
        if (!project) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("NOT_FOUND");
        }

        const path = join(project, data.path.slice(1));

        const stat = await fs.stat(path).catch(() => null);

        if (!stat) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("NOT_FOUND");
        }
        // eslint-disable-next-line functional/no-let
        let pathToFile = path;

        if (stat.isDirectory()) {
          pathToFile = join(path, "index.html");
        }

        if ((await fs.isFile(pathToFile)) === false) {
          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("NOT_FOUND");
        }

        console.log(`call of: ${pathToFile}`);

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
      } catch {
        await WebServer.sendResponse(data.requestId, {
          status: 404,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          path: require("!raw-loader!src/webserver/404.html").default,
          headers: {},
        });
      }
    }
  );
});
