import { LocalizationDefinition } from './Localization';
import { DashboardDefinition, EntityDefinition } from './Entities';

/** Role-based access control for a manifest app. */
export type ManifestRoleAccessDefinition = {
  /** Security role names that are allowed access. */
  allowed?: string[];
};

/** Sitemap (navigation) configuration for a single app. */
export type ManifestAppSitemapDefinition = {
  /** Named area groups shown in the app's sidebar navigation. */
  groups?: {
    [key: string]: {
      title: string;
      order?: number;
      locale?: { [locale: string]: { title: string } };
    };
  };
};

/**
 * Definition of a single app within the manifest. An app groups entities
 * into areas with role-based access and its own sitemap navigation.
 *
 * @example
 * ```ts
 * const app: ManifestAppDefinition = {
 *   title: 'Admin Portal',
 *   roles: { allowed: ['SystemAdmin'] },
 * };
 * ```
 */
export type ManifestAppDefinition = {
  title?: string;
  roles?: ManifestRoleAccessDefinition;
  sitemap?: ManifestAppSitemapDefinition;
  [key: string]: unknown;
};

/** A collection of named app definitions keyed by app name. */
export type ManifestAppsDefinition = {
  [key: string]: ManifestAppDefinition;
};

/**
 * The top-level EAVFW manifest. Describes the full application model
 * including entities, apps, dashboards, localization, and error messages.
 *
 * @example
 * ```ts
 * const manifest: ManifestDefinition = {
 *   config: {},
 *   variables: {},
 *   apps: { portal: { title: 'Portal' } },
 *   entities: { account: { ... } },
 * };
 * ```
 */
export type ManifestDefinition = {
  /** Locale-keyed localization overrides. */
  localization?: { [locale: string]: LocalizationDefinition };
  /** Global configuration values. */
  config: Record<string, unknown>;
  /** Global variables available to expressions. */
  variables: Record<string, unknown>;
  /** Named app definitions. */
  apps: ManifestAppsDefinition;
  /** Entity definitions keyed by display name. */
  entities: { [entity: string]: EntityDefinition };
  /** Optional dashboard definitions. */
  dashboards?: { [dashboard: string]: DashboardDefinition };
  /** Locale-keyed error message overrides. */
  errorMessages?: { [locale: string]: { [code: string]: string } };
};
