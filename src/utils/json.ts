// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parse(json: string, def = {}): any {
  try {
    return JSON.parse(json);
  } catch {
    return def;
  }
}
