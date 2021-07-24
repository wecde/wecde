import Vue from "vue";
import VueRouter from "vue-router";

import Home from "@/pages/Home.vue";
import Editor from "@/pages/Editor.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/editor",
    name: "editor",
    component: Editor,
  },
];

const router = new VueRouter({
  routes,
  mode: "hash",
});

export default router;
