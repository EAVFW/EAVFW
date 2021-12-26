import { FormDefinition } from "../Forms";
import { LocaleDefinition } from "../Localization";
import { MultipleSiteMapDefinitions, SiteMapDefinition } from "../SiteMap";
import { ValidationDefinition } from "../Validation";
import { AttributeDefinition } from "./Attributes";
import { EntityViewsDefinition } from "./EntityViewsDefinition";


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
    validation?: { [validationKey: string]: ValidationDefinition }
    [x: string]: any
};