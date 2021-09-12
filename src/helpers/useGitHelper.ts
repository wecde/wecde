import { Toast } from "@capacitor/toast";
import type { GitAuth, GitProgressEvent } from "isomorphic-git";
import { useStore } from "src/store";
import { useI18n } from "vue-i18n";

export function useGitHelper() {
  const store = useStore();
  const i18n = useI18n();

  function onStart(message: string): void {
    store.commit("terminal/info", message);
  }

  function onDone(): void {
    store.commit("terminal/clear");
  }

  function onError(err: string | Error): void {
    store.commit("terminal/error", err);
  }

  function onProgress(event: GitProgressEvent): void {
    store.commit(
      "terminal/print",
      `${event.phase} (${
        event.total
          ? Math.round((event.loaded / event.total) * 100) + "%"
          : event.loaded
      })`
    );
  }

  function onAuth(url: string): GitAuth | void {
    const auth = store.getters["git-configs/getConfig"](url);

    if (!auth.username || !auth.password) {
      store.commit("terminal/warning", i18n.t("error.git.auth-not-ready"));
      return {
        cancel: true,
      };
    }

    return auth;
  }

  function onAuthFailure(): GitAuth {
    store.commit("terminal/error", i18n.t("error.login-failed"));
    void Toast.show({
      text: i18n.t("error.login-failed"),
    });

    return {
      cancel: true,
    };
  }

  function onAuthSuccess(): void {
    store.commit("terminal/success", i18n.t("alert.login-success"));
  }

  const onMessage =
    process.env.NODE_ENV === "development"
      ? function onMessage(message: string): void {
          console.log(`onMessage: ${message}`);
        }
      : undefined;

  const configs = {
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
    authorFor(url: string): {
      readonly name: string;
      readonly email: string;
    } {
      const auth = store.getters["git-configs/getConfig"](url);

      return {
        name: !!auth.name ? auth.name : "System OS",
        email: !!auth.email ? auth.email : "u0@localhost",
      };
    },
  };

  return {
    onStart,
    onDone,
    onError,
    onProgress,
    onAuth,
    onAuthFailure,
    onAuthSuccess,
    onMessage,
    configs,
  };
}
