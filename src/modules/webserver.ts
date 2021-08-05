/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cordova, IonicNativePlugin } from "@ionic-native/core";

class WebServerOriginal {
  public static readonly pluginName = "WebServer";
  public static readonly plugin = "cordova-plugin-webserver2";
  public static readonly pluginRef = "window.webserver";
  public static readonly repo =
    "https://github.com/nguyenthanh1995/cordova-plugin-webserver2.git";
  public static readonly platforms = ["Android", "iOS"];

  // eslint-disable-next-line functional/functional-parameters
  start(..._props: readonly any[]): any {
    return cordova(this, "start", { callbackOrder: "reverse" }, [..._props]);
  }
  // eslint-disable-next-line functional/functional-parameters
  stop(..._props: readonly any[]): any {
    return cordova(this, "stop", {}, [..._props]);
  }
  // eslint-disable-next-line functional/functional-parameters
  onRequest(..._props: readonly any[]): any {
    return cordova(
      this,
      "onRequest",
      { callbackOrder: "reverse", observable: true, clearFunction: "stop" },
      [..._props]
    );
  }
  // eslint-disable-next-line functional/functional-parameters
  sendResponse(..._props: readonly any[]): any {
    return cordova(this, "sendResponse", {}, [..._props]);
  }
}

const WebServer = new WebServerOriginal();
export { WebServer };
