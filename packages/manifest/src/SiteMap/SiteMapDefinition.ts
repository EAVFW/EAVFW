import { DashboardLocaleDefinition, EntityLocaleDefinition } from '../Localization';

/**
 * Places an entity or dashboard into a specific app, area, and group in
 * the navigation sitemap.
 */
export type SiteMapDefinition = {
  app: string;
  area: string;
  group: string;
  title?: string;
  dashboards?: Record<string, unknown>;
  order?: number;
  locale?: { [locale: string]: DashboardLocaleDefinition | EntityLocaleDefinition };
};
