export type ProfessionHistoryEntry = {
  /** Unikalny identyfikator (dla trackBy). */
  id: string;
  /** Nazwa profesji / poziomu (np. Roadwarden, Watchman). */
  profession: string;
  /** Krótki wpis w stylu dziennika (opcjonalnie). */
  note?: string;
  /** Data / czas w formie stringa do UI (opcjonalnie). */
  dateLabel?: string;
};

