import mitt from "mitt";

const emitter = mitt<{
  readonly "open:project": string;
}>();

export function useEventGlobal() {
  return emitter;
}
