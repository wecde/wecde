import { atob } from "js-base64";
import { computed, ComputedRef } from "vue";
import { useRoute } from "vue-router";

export function useFullpathFromRoute(): ComputedRef<string | null> {
  const route = useRoute();

  return computed<string | null>(() => {
    const raw = route.query.data;
    if (typeof raw === "string") {
      try {
        return JSON.parse(atob(raw)).fullpath ?? null;
      } catch {}
    }

    return null;
  });
}
