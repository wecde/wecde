import { atob } from "js-base64";
import { computed, ComputedRef } from "vue";
import { useRoute } from "vue-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFullpathFromRoute(): ComputedRef<any | null> {
  const route = useRoute();

  return computed<string | null>(() => {
    const raw = route.query.data;
    if (typeof raw === "string") {
      try {
        const data = JSON.parse(atob(raw)).fullpath ?? null;

        if (data?.fullpath) {
          return data;
        }
      } catch {}
    }

    return null;
  });
}
