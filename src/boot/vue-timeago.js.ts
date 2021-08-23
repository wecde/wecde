import { boot } from "quasar/wrappers";
import VueTimeagoJS from "vue-timeago.js";

export default boot(({ app }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(VueTimeagoJS as any);
});
