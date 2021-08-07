import { RouteRecordRaw } from "vue-router";

// eslint-disable-next-line functional/prefer-readonly-type
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/Home.vue"),
      },
      {
        path: "/editor",
        component: () => import("pages/Editor.vue"),
      },
      {
        path: "/settings",
        component: () => import("src/pages/Settings.vue"),
      },
    ],
  },
];

export default routes;
