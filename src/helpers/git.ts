import { Toast } from "@capacitor/toast";
import { i18n } from "boot/i18n";
import type { GitAuth, GitProgressEvent } from "isomorphic-git-cross";
import { store } from "src/store";

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

export function onMessage(message: string): void {
  console.log(`onMessage: ${message}`);
}

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
