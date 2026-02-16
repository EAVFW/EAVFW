/** Base locale fields shared by entities and dashboards. */
type BaseLocaleDefinition = {
  displayName: string;
  description?: string;
};

/** Locale override for an entity — includes `pluralName`. */
export type EntityLocaleDefinition = BaseLocaleDefinition & {
  pluralName: string;
};

/** Locale override for a dashboard. */
export type DashboardLocaleDefinition = BaseLocaleDefinition;
