import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import("../pages/Home"),
  },
  {
    path: "/editor",
    name: "editor",
    component: () => import("../pages/Editor"),
  },
];

const router = new VueRouter({
  routes,
  mode: "hash",
});

export default router;
