import { basename } from "path-cross";
import { useI18n } from "vue-i18n";

export function useFilenameValidate() {
  const i18n = useI18n();

  return (
    newName: string,
    oldName: string | false,
    siblingName: readonly string[],
    checkEmpty = true
  ): string | true => {
    if (!newName && checkEmpty) {
      return i18n.t("validate.name.not-empty");
    }

    if (
      newName.length > 255 ||
      newName.split("/").some((item) => {
        if (/window/.exec(navigator.userAgent)) {
          if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(item)) {
            return true;
          }
        }

        return /[<>:"/\\|?*\u0000-\u001F]/g.test(item);
      }) ||
      siblingName.some(
        (name) =>
          name === newName &&
          (oldName === false ? true : name !== basename(oldName))
      )
    ) {
      return i18n
        .t("validate.name.invalid")
        .replace("$$name", `<strong>${newName}</strong>`);
    }

    return true;
  };
}
