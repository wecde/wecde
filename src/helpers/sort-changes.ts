import { sort } from "fast-sort";
import { basename } from "path-cross";
import type { StateInterface } from "src/store";

export default function sortChanges(
  // eslint-disable-next-line functional/prefer-readonly-type
  list: (readonly [
    string,
    StateInterface["editor"]["git"]["statusMatrix"]["matrix"][""]
  ])[],
  sortBy: StateInterface["git-configs"]["sortBy"]
  // eslint-disable-next-line functional/prefer-readonly-type
): string[] {
  switch (sortBy) {
    case "name":
      return sort(list)
        .asc(([filepath]) => basename(filepath))
        .map(([filepath]) => filepath);
    case "path":
      return sort(list)
        .asc(([filepath]) => filepath)
        .map(([filepath]) => filepath);
    case "status":
      return sort(list)
        .asc([
          ([, matrix]) => {
            const status = matrix.join("");

            if (status.startsWith("02")) {
              return "U"; // added
            }
            if (status.startsWith("12")) {
              return "M"; // modified
            }
            if (status.startsWith("10")) {
              return "D"; // deleted
            }
          },
          ([filepath]) => filepath,
        ])
        .map(([filepath]) => filepath);
  }

  return list.map(([filepath]) => filepath);
}
