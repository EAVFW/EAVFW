import { RibbonViewInfo } from '../Ribbon';
import { ViewColumnDefinition } from './ViewColumnDefinition';

/** Paging configuration for a view. */
export type ViewPagingDefinition = {
  enabled?: boolean;
  pageSize?: number;
};

/**
 * Defines a view (list/grid) for displaying multiple entity records.
 * Includes column layout, ribbon actions, filtering, paging, and
 * role-based access.
 */
export type ViewDefinition = {
  type?: string;
  mobile?: boolean;
  title?: string;
  roles?: {
    allowed?: string[];
  };
  ribbon?: RibbonViewInfo;
  selection?: boolean;
  filter?: string;
  control?: string;
  paging?: boolean | ViewPagingDefinition;
  columns?: {
    [column: string]: ViewColumnDefinition;
  };
  cardIcon?: string;
};
