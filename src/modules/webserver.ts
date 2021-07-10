// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IonicNativePlugin, cordova } from "@ionic-native/core";

class WebServerOriginal {
  public static readonly pluginName = "WebServer";
  public static readonly plugin = "cordova-plugin-webserver2";
  public static readonly pluginRef = "window.webserver";
  public static readonly repo =
    "https://github.com/nguyenthanh1995/cordova-plugin-webserver2.git";
  public static readonly platforms = ["Android", "iOS"];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  start(...props: any[]): any {
    return cordova(this, "start", { callbackOrder: "reverse" }, arguments);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stop(...props: any[]): any {
    return cordova(this, "stop", {}, arguments);
  }
  onRequest(): any {
    return cordova(
      this,
      "onRequest",
      { callbackOrder: "reverse", observable: true, clearFunction: "stop" },
      arguments
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendResponse(...props: any[]): any {
    return cordova(this, "sendResponse", {}, arguments);
  }
}

const WebServer = new WebServerOriginal();
export { WebServer };
