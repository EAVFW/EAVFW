import { RibbonViewInfo } from '../Ribbon';

/** A form definition used within a type-scoped (lookup inline) context. */
export type TypeFormDefinition = {
  type: 'Main';
  name: string;
  tab: string;
  column: string;
  section: string;
  view?: string;
  filter?: string;
  ribbon?: RibbonViewInfo;
};
