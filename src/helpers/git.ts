import { Toast } from "@capacitor/toast";
import { i18n } from "boot/i18n";
import type { GitAuth, GitProgressEvent } from "isomorphic-git";
import { isIgnored, STAGE, TREE, walk, WORKDIR } from "isomorphic-git";
import type { default as $fs } from "modules/fs";
import { store } from "src/store";

export function worthWalking(filepath: string, root?: string): boolean {
  if (filepath === "." || root == null || root.length === 0 || root === ".") {
    return true;
  }

  if (filepath === root) {
    return true;
  }

  const filepathSpited = filepath.split("/");
  const rootSpited = root.split("/");

  if (root.length >= filepath.length) {
    return filepathSpited.every((item, index) => rootSpited[index] === item);
  } else {
    return rootSpited.every((item, index) => filepathSpited[index] === item);
  }
}

export function onStart(message: string): void {
  store.commit("terminal/info", message);
}

export function onDone(): void {
  store.commit("terminal/clear");
}

export function onError(err: string | Error): void {
  store.commit("terminal/error", err);
}

export function onProgress(event: GitProgressEvent): void {
  store.commit(
    "terminal/print",
    `${event.phase} (${
      event.total
        ? Math.round((event.loaded / event.total) * 100) + "%"
        : event.loaded
    })`
  );
}

export function onAuth(url: string): GitAuth | void {
  const auth = store.getters["git-configs/getConfig"](url);

  if (!auth.username || !auth.password) {
    store.commit("terminal/warning", i18n.global.t("error.git.auth-not-ready"));
    return {
      cancel: true,
    };
  }

  return auth;
}

export function onAuthFailure(): GitAuth {
  store.commit("terminal/error", i18n.global.t("error.login-failed"));
  void Toast.show({
    text: i18n.global.t("error.login-failed"),
  });

  return {
    cancel: true,
  };
}

export function onAuthSuccess(): void {
  store.commit("terminal/success", i18n.global.t("alert.login-success"));
}

export const onMessage =
  process.env.NODE_ENV === "development"
    ? function onMessage(message: string): void {
        console.log(`onMessage: ${message}`);
      }
    : undefined;

export const configs = {
  corsProxy: "https://cors.isomorphic-git.org",
  get singleBranch(): boolean {
    if (store.state.settings["clone git**single branch"] === true) {
      return true;
    }

    return false;
  },
  get noCheckout(): boolean {
    if (store.state.settings["clone git**no checkout"] === true) {
      return true;
    }

    return false;
  },
  get noTags(): boolean {
    if (store.state.settings["clone git**no tags"] === true) {
      return true;
    }

    return false;
  },
  get depth(): number | undefined {
    if (store.state.settings["clone git**depth"] == null) {
      return void 0;
    }

    return (store.state.settings["clone git**depth"] as number) - 0;
  },
  get since(): Date | undefined {
    return void 0;

    // if (store.state.settings["clone git**single branch"] == null) {
    //   return void 0;
    // }

    // return new Date(store.state.settings["clone git**single branch"] as string);
  },
  // eslint-disable-next-line functional/prefer-readonly-type
  get exclude(): string[] {
    return (
      ((store.state.settings["clone git**exclude"] as string) || "")
        ?.replace(/,\s+/g, ",")
        .split(",")
        .filter(Boolean) ?? []
    );
  },
};

const cache = {};
export async function statusMatrix({
  dir,
  fs,
  gitdir = dir + "/.git",
  ref = "HEAD",
  filepaths = ["."],
  filter = () => true,
}: {
  readonly fs: typeof $fs;
  readonly dir: string;
  readonly gitdir?: string;
  readonly ref?: string;
  readonly filepaths?: readonly string[];
  readonly filter?: (filepath: string) => boolean;
}): Promise<readonly (readonly [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2])[]> {
  console.time("statusMatrix");

  const ret = await walk({
    fs,
    cache,
    dir,
    gitdir,
    trees: [TREE({ ref }), WORKDIR(), STAGE()],
    map: async function (filepath, [head, workdir, stage]) {
      // Ignore ignored files, but only if they are not already tracked.
      if (!head && !stage && workdir) {
        if (
          await isIgnored({
            fs,
            dir,
            filepath,
          })
        ) {
          return null;
        }
      }
      // match against base paths
      if (!filepaths.some((base) => worthWalking(filepath, base))) {
        return null;
      }
      // Late filter against file names
      if (filter) {
        if (!filter(filepath)) return;
      }

      // For now, just bail on directories
      const headType = head && (await head.type());
      if (headType === "tree" || headType === "special") return;
      if (headType === "commit") return null;

      const workdirType = workdir && (await workdir.type());

      if (workdirType === "special") return;

      const stageType = stage && (await stage.type());
      if (stageType === "commit") return null;
      if (stageType === "special") return;

      // Figure out the oids, using the staged oid for the working dir oid if the stats match.
      const headOid = head ? await head.oid() : undefined;
      const stageOid = stage ? await stage.oid() : undefined;
      // eslint-disable-next-line functional/no-let
      let workdirOid;
      if (!head && workdir && !stage) {
        // We don't actually NEED the sha. Any sha will do
        // TODO: update this logic to handle N trees instead of just 3.
        workdirOid = "42";
      } else if (workdir) {
        workdirOid = (await workdir.oid()) ?? "0x";
      }

      const entry = [undefined, headOid, workdirOid, stageOid];

      const result = entry.map((value) => entry.indexOf(value));
      // eslint-disable-next-line functional/immutable-data
      result.shift(); // remove leading undefined entry
      return [filepath, ...result];
    },
  });

  console.timeEnd("statusMatrix");

  return ret;
}
