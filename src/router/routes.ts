import { RouteRecordRaw } from "vue-router";

// eslint-disable-next-line functional/prefer-readonly-type
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("pages/Home.vue"),
      },
      {
        path: "/editor",
        name: "editor",
        component: () => import("pages/Editor.vue"),
      },
      {
        path: "/settings",
        name: "settings",
        component: () => import("src/pages/Settings.vue"),
        meta: {
          hideNavigation: true,
        },
      },
    ],
  },
];

export default routes;
