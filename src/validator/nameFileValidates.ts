import type { ComputedRef, Ref } from "@vue/composition-api";
import { computed } from "@vue/composition-api";
import { basename } from "path";

export default function nameFileValidates(
  nameCheck: Ref<string>,
  oldName: Ref<string> | false,
  namesExists: Ref<string[]>,
  checkNameEmpty: Ref<boolean> | true = true
): ComputedRef<string | false> {
  return computed<string | false>(() => {
    if (!nameCheck.value && (checkNameEmpty === true || checkNameEmpty.value)) {
      return "A file or folder name must be provided.";
    }

    if (
      namesExists.value.some(
        (name) =>
          name === nameCheck.value &&
          (oldName === false ? true : name !== basename(oldName.value))
      )
    ) {
      return `A file or folder <strong>${nameCheck.value}</strong> already exists at this localtion. Please choose a different name.`;
    }

    return false;
  });
}
