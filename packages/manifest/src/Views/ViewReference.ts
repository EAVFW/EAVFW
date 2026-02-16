import { EntityDefinition } from '../Entities';
import { RibbonViewInfo } from '../Ribbon';
import { ViewDefinition } from './ViewDefinition';

/**
 * Runtime reference to a view, including the resolved entity definition,
 * attribute metadata, and optional ribbon configuration. Used internally
 * by the view rendering engine.
 */
export type ViewReference = {
  ribbon?: RibbonViewInfo;
  key: string;
  entity: EntityDefinition;
  viewName?: string;
  entityName: string;
  attribute: string;
  attributeType?: 'polylookup' | 'lookup';
  inlinePolyLookup?: boolean;
  polylookup?: 'inline' | 'split';
  filter?: string;
  view?: ViewDefinition;
};
