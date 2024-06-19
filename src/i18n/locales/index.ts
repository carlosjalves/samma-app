import enUS from "./en-US";

export enum AvailableLanguage {
  enUs = "en-US",
  deDE = "de-DE",
}

export default {
  [AvailableLanguage.enUs]: enUS,
} as const;
