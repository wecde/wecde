var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
import { IonicNativePlugin, cordova } from "@ionic-native/core";
var WebServerOriginal = /** @class */ (function (_super) {
  __extends(WebServerOriginal, _super);
  function WebServerOriginal() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  WebServerOriginal.prototype.start = function () {
    return cordova(this, "start", { callbackOrder: "reverse" }, arguments);
  };
  WebServerOriginal.prototype.stop = function () {
    return cordova(this, "stop", {}, arguments);
  };
  WebServerOriginal.prototype.onRequest = function () {
    return cordova(
      this,
      "onRequest",
      { callbackOrder: "reverse", observable: true, clearFunction: "stop" },
      arguments
    );
  };
  WebServerOriginal.prototype.sendResponse = function () {
    return cordova(this, "sendResponse", {}, arguments);
  };
  WebServerOriginal.pluginName = "WebServer";
  WebServerOriginal.plugin = "cordova-plugin-webserver2";
  WebServerOriginal.pluginRef = "window.webserver";
  WebServerOriginal.repo =
    "https://github.com/nguyenthanh1995/cordova-plugin-webserver2.git";
  WebServerOriginal.platforms = ["Android", "iOS"];
  return WebServerOriginal;
})(IonicNativePlugin);
var WebServer = new WebServerOriginal();
export { WebServer };
