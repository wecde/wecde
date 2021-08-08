import { i18n } from "boot/i18n";
import { basename } from "path-cross";
import type { ComputedRef, Ref } from "vue";
import { computed } from "vue";

export default function nameFileValidates(
  nameCheck: Ref<string>,
  oldName: Ref<string> | false,
  namesExists: Ref<readonly string[]>,
  checkNameEmpty: Ref<boolean> | true = true
): ComputedRef<string | false> {
  return computed<string | false>(() => {
    if (!nameCheck.value && (checkNameEmpty === true || checkNameEmpty.value)) {
      return i18n.global.t("alert.file-name-not-empty");
    }

    if (
      nameCheck.value.length > 255 ||
      nameCheck.value.split("/").some((item) => {
        if (/window/.exec(navigator.userAgent)) {
          if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(item)) {
            return true;
          }
        }

        return /[<>:"/\\|?*\u0000-\u001F]/g.test(item);
      }) ||
      namesExists.value.some(
        (name) =>
          name === nameCheck.value &&
          (oldName === false ? true : name !== basename(oldName.value))
      )
    ) {
      return i18n.global.t("alert.file-name-invalidate", {
        name: nameCheck.value,
      });
    }

    return false;
  });
}
