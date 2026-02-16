import { SiteMapDefinition } from './SiteMapDefinition';

/** Named collection of sitemap definitions when an entity appears in multiple apps. */
export type MultipleSiteMapDefinitions = { [key: string]: SiteMapDefinition };

/**
 * Type guard that distinguishes a single {@link SiteMapDefinition} from a
 * {@link MultipleSiteMapDefinitions} map.
 *
 * @param obj - The value to check.
 * @returns `true` if the value is a single sitemap definition.
 */
export function isSingleSiteMapDefinition(
  obj: MultipleSiteMapDefinitions | SiteMapDefinition,
): obj is SiteMapDefinition {
  return obj !== undefined && 'app' in obj;
}
