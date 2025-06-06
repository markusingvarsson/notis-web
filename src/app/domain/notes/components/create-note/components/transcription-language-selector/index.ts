export interface Language {
  name: string;
  value: SupportedLanguageCode | null;
}

export const supportedLanguageCodes = ['en-US', 'sv-SE'] as const;
export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export function getSupportedLanguageCode(
  languageCode: string | null
): SupportedLanguageCode | null {
  return supportedLanguageCodes.includes(languageCode as SupportedLanguageCode)
    ? (languageCode as SupportedLanguageCode)
    : null;
}
