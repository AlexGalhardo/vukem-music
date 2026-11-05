import { usePage } from "@inertiajs/react";
import type { Locale, Localized, SharedProps } from "../types";

export function useI18n() {
  const { locale: rawLocale, messages } = usePage<SharedProps>().props;
  const locale: Locale = rawLocale === "pt-BR" ? "pt-BR" : "en";
  return {
    locale,
    t: (key: string) => messages?.[key] ?? key,
    local: <T>(value: Localized<T>): T => value[locale] ?? value.en,
    href: (path: string) => `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`,
  };
}
