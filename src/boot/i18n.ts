import ISO from "iso-639-1";
import { basename } from "path-cross";
import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";

export const SUPPORT_LOCALES = require
  .context("src/locales", true, /[a-z]{2}\.json$/)
  .keys()
  .map((filename) => {
    const code = basename(filename, ".json");

    return {
      label: ISO.getNativeName(code),
      value: code,
    };
  });

export default boot(({ app, store }) => {
  const i18n = createI18n({
    // silentTranslationWarn: true,
    // silentFallbackWarn: true,
  });

  app.use(i18n);

  function setI18nLanguage(locale: string): void {
    // eslint-disable-next-line functional/immutable-data
    i18n.global.locale = locale;
    document.querySelector("html")?.setAttribute("lang", locale);
  }

  function isSupport(locale: string): boolean {
    return SUPPORT_LOCALES.some(({ value }) => value === locale);
  }

  async function loadLocaleMessages(locale: string): Promise<void> {
    if (isSupport(locale)) {
      const messages = await import(
        /* webpackChunkName: "locale-[request]" */ `src/locales/${locale}.json`
      );
      i18n.global.setLocaleMessage(locale, messages.default);
      setI18nLanguage(locale);
    }
  }

  store.watch(
    () => store.state.settings["appearance**language"],
    (newValue) => void loadLocaleMessages(newValue as string),
    {
      immediate: true,
    }
  );
});
