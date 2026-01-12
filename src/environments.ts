/**
 * Prosta konfiguracja środowiska (bez mechanizmu fileReplacements).
 *
 * Jeśli chcesz inne wartości dla prod/dev, dodamy pliki per środowisko i podmianę w builderze.
 */
export const environment = {
  /** Bazowy URL backendu (Django/DRF). */
  apiBaseUrl: 'http://localhost:8000',
};
