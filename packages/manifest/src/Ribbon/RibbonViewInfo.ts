import { RibbonViewItemInfo } from './RibbonViewItemInfo';

/** Named collection of ribbon buttons keyed by command name. */
export type RibbonViewInfo = {
  [key: string]: RibbonViewItemInfo;
};
