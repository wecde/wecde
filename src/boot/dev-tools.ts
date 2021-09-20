import eruda from "eruda2";
import { boot } from "quasar/wrappers";

export default boot(({ store }) => {
  store.watch(
    () => store.state.settings["help**developer tools"] as boolean,
    (val) => {
      try {
        if (val) {
          eruda.init({
            useShadowDom: true,
            autoScale: true,
            defaults: {
              displaySize: 50,
              transparency: 0.9,
              theme: "Monokai Pro",
            },
          });
        } else {
          eruda.destroy();
        }
      } catch {}
    },
    {
      immediate: true,
    }
  );
});
