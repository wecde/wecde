import { onMounted, ref } from "vue";

export function useIsMounted() {
  const isMounted = ref<boolean>(false);
  onMounted(() => (isMounted.value = true));

  return isMounted;
}
