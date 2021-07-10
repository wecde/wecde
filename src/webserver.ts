import store from "./store";
import { WebServer } from "./modules/webserver";
import { stat, getUri, readFile } from "@/modules/filesystem";
import { join } from "path";
import { extname, rawText } from "./utils";
import codeEruda from "raw-loader!eruda2/eruda.js";
import { encode } from "base-64";

const base64CodeEruda =
  `data:application/javascript;base64,` +
  encode(
    unescape(
      encodeURIComponent(
        codeEruda +
          `;
          eruda.init({
      useShadowDom: true,
      autoScale: true,

      defaults: {
        displaySize: 50,
        transparency: 0.9,
        theme: "Monokai Pro",
      },
    });`
      )
    )
  );
const eruda2 = document.createElement("script");
eruda2.setAttribute("type", "text/javascript");
eruda2.setAttribute("src", base64CodeEruda);
eruda2.setAttribute("id", "eruda-loader");

function addEruda(html: string): string {
  const virualDOM = new DOMParser().parseFromString(html, "text/html");
  virualDOM.head.prepend(eruda2.cloneNode(true));

  return virualDOM.documentElement.outerHTML;
}

try {
  WebServer.onRequest().subscribe(async (data: any) => {
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

    if (project) {
      const path = join(`projects/${project}`, data.path.slice(1));

      const thisStat = await stat(path);

      try {
        if (thisStat) {
          let pathToFile = path;

          if (thisStat.type === "directory") {
            pathToFile = join(path, "index.html");
          }

          if (await stat(pathToFile)) {
            if (/^\.?html?$/.test(extname(pathToFile))) {
              WebServer.sendResponse(data.requestId, {
                status: 200,
                body: addEruda(rawText(await readFile(pathToFile))),
                headers: {
                  "Content-Type": "text/html",
                },
              });
            } else {
              WebServer.sendResponse(data.requestId, {
                status: 201,
                path: await getUri(pathToFile),
                headers: {},
              });
            }
          } else {
            throw new Error("NOT_FOUND");
          }
        } else {
          throw new Error("NOT_FOUND");
        }
      } catch {
        WebServer.sendResponse(data.requestId, {
          status: 404,
          body: `
          <h1>404 Not Found</h1>
        `,
          headers: {
            "Content-Type": "text/html",
          },
        });
      }
    } else {
      WebServer.sendResponse(data.requestId, {
        status: 404,
        body: `
        <h1>404 Not Found</h1>
        <h3>Please select project Web then use WebServer.</h3>
      `,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  });
} catch {
  console.warn("WebServer not available.");
}
