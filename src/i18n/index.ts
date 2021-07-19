import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  silentTranslationWarn: true,
});

const loadedLanguages = ["en"]; // our default language that is preloaded
const allLanguages = require
  .context("@/locales", true, /[a-zA-Z_-]+\.json$/)
  .keys();

function setI18nLanguage(lang: string): void {
  i18n.locale = lang;
  document.querySelector("html")?.setAttribute("lang", lang);
}

export async function loadLanguageAsync(lang: string): Promise<void> {
  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang));
  }

  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang));
  }

  if (allLanguages.includes(lang)) {
    await import(`@/locales/${lang}.json`).then((messages) => {
      i18n.setLocaleMessage(lang, messages.default);
      loadedLanguages.push(lang);
      return setI18nLanguage(lang);
    });
  }
}

if ("locale" in localStorage === false) {
  localStorage.setItem(
    "locale",
    navigator.language.split("-").slice(0, -1).join("-")
  );
}

loadLanguageAsync(localStorage.getItem("locale") || "");

export default i18n;
