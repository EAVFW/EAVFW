export function enumDisplayNameFactory(data: [string, unknown], locale: string): string {
  if (typeof data[1] === 'object' && data[1] !== null) {
    const entry = data[1] as Record<string, unknown>;
    if (
      typeof entry.locale === 'object' &&
      entry.locale !== null &&
      locale in (entry.locale as Record<string, unknown>)
    ) {
      const localeEntry = (entry.locale as Record<string, Record<string, unknown>>)[locale];
      return (localeEntry.displayName as string) ?? (entry.text as string) ?? data[0];
    }

    return entry.text as string;
  }
  return data[0];
}
