import { Dark } from "quasar";
import { boot } from "quasar/wrappers";
import { store } from "src/store";
import { isDark } from "src/store/settings/options support/ace-themes";

export default boot(() => {
  store.watch(
    () => store.state.settings["appearance**theme"],
    (newValue) => {
      Dark.set(isDark(newValue as string));
    },
    {
      immediate: true,
    }
  );
});
