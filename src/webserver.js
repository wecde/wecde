import store from "./store";
import { WebServer } from "./modules/webserver";
import { stat, getUri } from "@/modules/filesystem";
import { join } from "path";
import { extname } from "./utils";

WebServer.onRequest().subscribe(async (data) => {
  /// get project

  const { project } = store.state.editor;

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
          WebServer.sendResponse(data.requestId, {
            status: extname(pathToFile) === "html" ? 200 : 201,
            path: await getUri(pathToFile),
            headers: {},
          });
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
