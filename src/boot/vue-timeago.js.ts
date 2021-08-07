import { boot } from "quasar/wrappers";
import VueTimeagoJS from "vue-timeago.js";

export default boot(({ app }) => {
  app.use(VueTimeagoJS);
});
