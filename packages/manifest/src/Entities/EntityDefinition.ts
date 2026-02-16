import {
  DashboardLocaleDefinition,
  EntityLocaleDefinition,
} from '../Localization/LocaleDefinition';
import { FormDefinition, FormTabDefinitionWithColumns } from '../Forms';
import { MultipleSiteMapDefinitions, SiteMapDefinition } from '../SiteMap';
import { ValidationDefinitionV1, ValidationDefinitionV2 } from '../Validation';
import { AttributeDefinition } from './Attributes';
import { EntityViewsDefinition } from './EntityViewsDefinition';
import { RibbonViewItemInfo } from '../Ribbon/RibbonViewItemInfo';

/** Identifies a form to open when a wizard trigger fires. */
export type WizardFormTrigger = {
  name: string;
};
/** Defines how a wizard is triggered — from a ribbon button, a form, or both. */
export type WizardTrigger = {
  visibleForForms?: boolean;
  ribbon?: 'NEW' | string | RibbonViewItemInfo;
  /* Either the string is a form on current entity, or an object with addition information */
  form?: string | WizardFormTrigger;
};
/** A collection of named wizard triggers. */
export type WizardTriggers = {
  [key: string]: WizardTrigger;
};
/** Toast notification configuration for wizard messages. */
export type IWizardMessageToast = {
  timeout?: number;
};
/** A message displayed during wizard transitions (e.g. info, error). */
export type IWizardMessage = {
  intent?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  detailedMessage?: string;
  toast?: IWizardMessageToast;
};
/** Named collection of wizard messages. */
export type IWizardMessages = {
  [key: string]: IWizardMessage;
};
/** An action button rendered in a wizard tab (e.g. "Submit"). */
export type IWizardTabAction = {
  text: string;
  workflow?: string;
};
/** Named collection of wizard tab actions. */
export type IWizardTabActions = {
  [key: string]: IWizardTabAction;
};
/** A single tab (step) within a wizard, with optional visibility expressions. */
export type WizardTab = {
  visible?: string | boolean;
  title?: string;
  locale?: {
    [localeKey: string]: {
      title: string;
    };
  };
  columns: FormTabDefinitionWithColumns['columns'];
  onTransitionOut?: {
    workflow: string;
  };
  onTransitionIn?: {
    message: IWizardMessage;
    workflow: string;
  };
  control?: string;
  actions?: IWizardTabActions;
};
/** Named collection of wizard tabs. */
export type WizardTabsDefinition = {
  [key: string]: WizardTab;
};
/** Full wizard definition with triggers, tabs, and a title. */
export type WizardsDefinition = {
  triggers: WizardTriggers;
  tabs: WizardTabsDefinition;
  title: string;
};
/** Named collection of wizard definitions for an entity. */
export type WizardsCollection = {
  [key: string]: WizardsDefinition;
};

/**
 * Defines a single entity in the EAVFW manifest. Contains metadata (names,
 * schema info), attributes, forms, views, validation rules, and wizards.
 *
 * @example
 * ```ts
 * const entity: EntityDefinition = {
 *   displayName: 'Account',
 *   pluralName: 'Accounts',
 *   logicalName: 'account',
 *   schemaName: 'Account',
 *   collectionSchemaName: 'accounts',
 *   attributes: { ... },
 * };
 * ```
 */
export type EntityDefinition = {
  pluralName: string;
  collectionSchemaName: string;
  displayName: string;
  schemaName: string;
  logicalName: string;
  control?: string;
  locale?: { [locale: string]: EntityLocaleDefinition };
  sitemap?: MultipleSiteMapDefinitions | SiteMapDefinition;
  attributes: { [attribute: string]: AttributeDefinition };
  TPT?: string;
  forms?: {
    [formName: string]: FormDefinition;
  };
  views?: EntityViewsDefinition;
  validation?: { [validationKey: string]: ValidationDefinitionV1 | ValidationDefinitionV2 };
  wizards?: WizardsCollection;
  [x: string]: unknown;
};

/** A dashboard panel definition, optionally with a custom control and sitemap entry. */
export type DashboardDefinition = {
  key?: string;
  control?: string;
  locale?: { [locale: string]: DashboardLocaleDefinition };
  sitemap?: MultipleSiteMapDefinitions | SiteMapDefinition;
  [x: string]: unknown;
};
