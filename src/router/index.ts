import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/Home.vue"),
  },
  {
    path: "/editor",
    name: "editor",
    component: () => import("@/pages/Editor.vue"),
  },
];

const router = new VueRouter({
  routes,
  mode: "hash",
});

export default router;
