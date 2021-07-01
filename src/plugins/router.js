import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import("../pages/Home"),
  },
  {
    path: "/editor/:project/(*?)",
    component: () => import("../pages/Project"),
  },
  {
    path: "/about",
    component: () => import("../pages/About"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
