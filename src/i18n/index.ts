import i18n from "i18next";
// TODO: import LanguageDetector from "i18next-browser-languagedetector"; // TODO JNL
import { initReactI18next } from "react-i18next";

import res, { AvailableLanguage } from "./locales";

export { AvailableLanguage } from "./locales";

export const resources = res;
export const availableLanguages = Object.keys(resources);
export const defaultNS = "common";

i18n
  .use(initReactI18next)
  // TODO JNL: to be defined in the future the way we set the active
  //   1. By browser preferences
  //   2. By user profile preferences
  //.use(LanguageDetector)
  .init({
    resources,
    defaultNS,
    //debug: true,
    fallbackLng: AvailableLanguage.enUs,
    lowerCaseLng: false,
    load: "languageOnly",
  });

export default i18n;
