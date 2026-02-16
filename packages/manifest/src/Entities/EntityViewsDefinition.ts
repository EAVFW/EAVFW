import { ViewDefinition } from '../Views';

/** A collection of named view definitions belonging to an entity. */
export type EntityViewsDefinition = {
  [viewKey: string]: ViewDefinition;
};
