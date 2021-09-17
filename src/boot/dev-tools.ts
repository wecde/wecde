import eruda from "eruda2";
import { boot } from "quasar/wrappers";

export default boot(({ store }) => {
  store.watch(
    () => store.state.settings["help**developer tools"] as boolean,
    (val) => {
      try {
        if (val) {
          eruda.init();
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
