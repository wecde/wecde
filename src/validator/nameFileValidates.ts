import type { ComputedRef, Ref } from "@vue/composition-api";
import { computed } from "@vue/composition-api";
import { basename } from "path";
import i18n from "@/i18n";

export default function nameFileValidates(
  nameCheck: Ref<string>,
  oldName: Ref<string> | false,
  namesExists: Ref<string[]>,
  checkNameEmpty: Ref<boolean> | true = true
): ComputedRef<string | false> {
  return computed<string | false>(() => {
    if (!nameCheck.value && (checkNameEmpty === true || checkNameEmpty.value)) {
      return i18n.t("A file or folder name must be provided") + "";
    }

    if (
      nameCheck.value.length > 255 ||
      nameCheck.value.split("/").some((item) => {
        if (navigator.userAgent.match(/window/)) {
          if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(item)) {
            return true;
          }
        }

        // eslint-disable-next-line no-control-regex
        return /[<>:"/\\|?*\u0000-\u001F]/g.test(item);
      }) ||
      namesExists.value.some(
        (name) =>
          name === nameCheck.value &&
          (oldName === false ? true : name !== basename(oldName.value))
      )
    ) {
      return (
        i18n.t(
          "A file or folder <strong>{name}</strong> already exists at this localtion Please choose a different names",
          {
            name: nameCheck.value,
          }
        ) + ""
      );
    }

    return false;
  });
}
