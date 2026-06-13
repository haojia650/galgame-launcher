import { useEffect, useState } from "react";
import type { Locale } from "../i18n";

const STORAGE_KEY = "game-launcher-locale";

const normalizeLocale = (value: string | null): Locale => {
  if (value === "zh-CN" || value === "en-US" || value === "ja-JP") {
    return value;
  }

  if (typeof navigator !== "undefined") {
    const language = navigator.language.toLowerCase();
    if (language.startsWith("zh")) {
      return "zh-CN";
    }
    if (language.startsWith("ja")) {
      return "ja-JP";
    }
  }

  return "en-US";
};

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en-US";
    }
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  return {
    locale,
    setLocale: setLocaleState
  };
}
