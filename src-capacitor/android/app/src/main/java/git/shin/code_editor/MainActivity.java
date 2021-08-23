package git.shin.code_editor;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.Bridge;

import java.util.ArrayList;
import java.lang.Object;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

public class MainActivity extends BridgeActivity {
  // @Override
  // public void onCreate(Bundle savedInstanceState) {
  //   super.onCreate(savedInstanceState);

  //   MainActivity that = this;

  //   ServiceWorkerController swController = ServiceWorkerController.getInstance();
  //   swController.setServiceWorkerClient(new ServiceWorkerClient() {
  //     @Override
  //     public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
  //       return that.bridge.getLocalServer().shouldInterceptRequest(request);
  //     }
  //   });
  // }
}
