import { FormDefinition, FormTabDefinitionBase, FormTabDefinitionWithColumns } from "../Forms";
import { LocaleDefinition } from "../Localization";
import { MultipleSiteMapDefinitions, SiteMapDefinition } from "../SiteMap";
import { ValidationDefinitionV1, ValidationDefinitionV2 } from "../Validation";
import { AttributeDefinition } from "./Attributes";
import { EntityViewsDefinition } from "./EntityViewsDefinition";

export type WizardFormTrigger = {
    name: string

}
export type WizardTrigger = {
    ribbon?: "NEW" | string;
    /* Either the string is a form on current entity, or an object with addition information */
    form?: string | WizardFormTrigger
}
export type WizardTriggers = {
    [key: string]:WizardTrigger

}
export type IWizardMessage = {
    intent?: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    detailedMessage?: string;

}
export type IWizardMessages = {
    [key: string]: IWizardMessage

}
export type WizardTab = {
    visible?: string | boolean;
    title?: string;
    locale?: {
        [localeKey: string]: {
            title: string;
        };
    };
    columns: FormTabDefinitionWithColumns["columns"]; 
    onTransitionOut?: {
        workflow: string
    },
    onTransitionIn?: {
        message: IWizardMessage,
        workflow: string
    },
    control?: string;
}
export type WizardTabs = {
    [key: string]: WizardTab;
    }
export type WizardsDefinition = {
    triggers: WizardTriggers;
    tabs: WizardTabs;
    title: string;
}
export type WizardsCollection= {
    [key: string]: WizardsDefinition
}

export type EntityDefinition = {
    pluralName: string;
    collectionSchemaName: string;
    displayName: string;
    schemaName: string;
    logicalName: string;
    locale?: { [locale: string]: LocaleDefinition };
    sitemap?: MultipleSiteMapDefinitions | SiteMapDefinition;
    attributes: { [attribute: string]: AttributeDefinition };
    TPT?: string,
    forms?: {
        [formName: string]: FormDefinition;
    };
    views?: EntityViewsDefinition,
    validation?: { [validationKey: string]: ValidationDefinitionV1 | ValidationDefinitionV2 }
    wizards?: WizardsCollection
    [x: string]: any
};